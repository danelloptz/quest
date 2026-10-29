const { PrismaClient } = require('@prisma/client');
const { normalizeText } = require('../utils/helpers');

const prisma = new PrismaClient();

async function getStats(req, res) {
  const total = await prisma.attempt.count();
  const completed = await prisma.attempt.count({ where: { status: 'COMPLETED' } });
  const inProgress = await prisma.attempt.count({ where: { status: 'IN_PROGRESS' } });

  const completedAttempts = await prisma.attempt.findMany({
    where: { status: 'COMPLETED' },
    select: { score: true, questionCount: true },
  });

  let avgScore = 0;
  if (completedAttempts.length > 0) {
    const sum = completedAttempts.reduce((acc, curr) => acc + (curr.score / curr.questionCount) * 100, 0);
    avgScore = (sum / completedAttempts.length).toFixed(1);
  }

  const top3 = await prisma.attempt.findMany({
    where: { status: 'COMPLETED' },
    orderBy: [{ score: 'desc' }, { durationSeconds: 'asc' }],
    take: 3,
  });

  return res.json({ total, completed, inProgress, avgScorePercent: avgScore, top3 });
}

// Teams CRUD
async function getTeams(req, res) {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
  return res.json({ teams });
}

async function createTeam(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: { message: 'Название обязательно' } });
  
  const team = await prisma.team.create({ data: { name: name.trim() } });
  return res.json({ team });
}

async function updateTeam(req, res) {
  const { id } = req.params;
  const { name, isActive } = req.body;
  const team = await prisma.team.update({
    where: { id },
    data: { name: name?.trim(), isActive },
  });
  return res.json({ team });
}

async function deleteTeam(req, res) {
  const { id } = req.params;
  await prisma.team.delete({ where: { id } });
  return res.json({ success: true });
}

// Players CRUD
async function getPlayers(req, res) {
  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: { lastName: 'asc' },
  });
  return res.json({ players });
}

async function createPlayer(req, res) {
  const { firstName, lastName, teamId } = req.body;
  if (!firstName || !lastName || !teamId) {
    return res.status(400).json({ error: { message: 'Заполните все поля' } });
  }
  const player = await prisma.player.create({
    data: { firstName: firstName.trim(), lastName: lastName.trim(), teamId },
  });
  return res.json({ player });
}

async function updatePlayer(req, res) {
  const { id } = req.params;
  const { firstName, lastName, teamId } = req.body;
  const player = await prisma.player.update({
    where: { id },
    data: { firstName: firstName?.trim(), lastName: lastName?.trim(), teamId },
  });
  return res.json({ player });
}

async function deletePlayer(req, res) {
  const { id } = req.params;
  await prisma.player.delete({ where: { id } });
  return res.json({ success: true });
}

// Questions CRUD
async function getQuestions(req, res) {
  const questions = await prisma.question.findMany({
    include: {
      correctTeam: true,
      acceptedAnswers: true,
      options: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ questions });
}

async function createQuestion(req, res) {
  const { type, text, correctTeamId, acceptedAnswers, options, isActive } = req.body;

  if (!text || !type) return res.status(400).json({ error: { message: 'Заполните тип и текст вопроса' } });

  const question = await prisma.$transaction(async (tx) => {
    const q = await tx.question.create({
      data: {
        type,
        text: text.trim(),
        correctTeamId: type === 'TEAM_SELECTION' ? correctTeamId : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    if (type === 'TEXT_INPUT' && Array.isArray(acceptedAnswers)) {
      for (const ans of acceptedAnswers) {
        if (ans && ans.trim()) {
          await tx.questionAcceptedAnswer.create({
            data: {
              questionId: q.id,
              text: ans.trim(),
              normalizedText: normalizeText(ans),
            },
          });
        }
      }
    } else if (type === 'MULTIPLE_CHOICE' && Array.isArray(options) && options.length === 4) {
      for (const opt of options) {
        await tx.questionOption.create({
          data: {
            questionId: q.id,
            text: opt.text.trim(),
            isCorrect: !!opt.isCorrect,
          },
        });
      }
    }

    return q;
  });

  return res.json({ question });
}

async function updateQuestion(req, res) {
  const { id } = req.params;
  const { type, text, correctTeamId, acceptedAnswers, options, isActive } = req.body;

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id },
      data: {
        type,
        text: text.trim(),
        correctTeamId: type === 'TEAM_SELECTION' ? correctTeamId : null,
        isActive,
      },
    });

    // Wipe previous sub-records for clean updates
    await tx.questionAcceptedAnswer.deleteMany({ where: { questionId: id } });
    await tx.questionOption.deleteMany({ where: { questionId: id } });

    if (type === 'TEXT_INPUT' && Array.isArray(acceptedAnswers)) {
      for (const ans of acceptedAnswers) {
        if (ans && ans.trim()) {
          await tx.questionAcceptedAnswer.create({
            data: {
              questionId: id,
              text: ans.trim(),
              normalizedText: normalizeText(ans),
            },
          });
        }
      }
    } else if (type === 'MULTIPLE_CHOICE' && Array.isArray(options) && options.length === 4) {
      for (const opt of options) {
        await tx.questionOption.create({
          data: {
            questionId: id,
            text: opt.text.trim(),
            isCorrect: !!opt.isCorrect,
          },
        });
      }
    }
  });

  return res.json({ success: true });
}

async function deleteQuestion(req, res) {
  const { id } = req.params;
  await prisma.question.delete({ where: { id } });
  return res.json({ success: true });
}

// Settings
async function getSettings(req, res) {
  let settings = await prisma.contestSettings.findFirst();
  if (!settings) {
    settings = await prisma.contestSettings.create({ data: { questionCount: 12 } });
  }

  const teamQs = await prisma.question.count({ where: { isActive: true, type: 'TEAM_SELECTION' } });
  const textQs = await prisma.question.count({ where: { isActive: true, type: 'TEXT_INPUT' } });
  const mcQs = await prisma.question.count({ where: { isActive: true, type: 'MULTIPLE_CHOICE' } });

  return res.json({ settings, activeCounts: { teamQs, textQs, mcQs } });
}

async function updateSettings(req, res) {
  const { questionCount } = req.body;
  if (!questionCount || questionCount < 3 || questionCount > 60) {
    return res.status(400).json({ error: { message: 'Количество вопросов должно быть от 3 до 60' } });
  }

  let settings = await prisma.contestSettings.findFirst();
  if (settings) {
    settings = await prisma.contestSettings.update({
      where: { id: settings.id },
      data: { questionCount: parseInt(questionCount, 10) },
    });
  } else {
    settings = await prisma.contestSettings.create({ data: { questionCount: parseInt(questionCount, 10) } });
  }

  return res.json({ settings });
}

// Admin Results List
async function getResults(req, res) {
  const results = await prisma.attempt.findMany({
    orderBy: [{ score: 'desc' }, { durationSeconds: 'asc' }],
  });
  return res.json({ results });
}

module.exports = {
  getStats,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getSettings,
  updateSettings,
  getResults,
};
