const { PrismaClient } = require('@prisma/client');
const { normalizeText } = require('../utils/helpers');

const prisma = new PrismaClient();

// Shuffle array helper
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function getOrCreateAttempt(req, res) {
  try {
    const { participantToken, name } = req.body;

    if (!participantToken || !name || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        error: { code: 'INVALID_PARTICIPANT_DATA', message: 'Имя должно быть от 2 до 50 символов' },
      });
    }

    const cleanName = name.trim();

    // Check existing attempt
    let attempt = await prisma.attempt.findUnique({
      where: { participantToken },
    });

    if (attempt) {
      return res.json({ attempt });
    }

    // Get Settings
    const settings = await prisma.contestSettings.findFirst();
    const targetCount = settings ? settings.questionCount : 12;

    // Fetch active questions grouped by type
    const activeTeamQs = await prisma.question.findMany({
      where: { isActive: true, type: 'TEAM_SELECTION' },
      include: { correctTeam: true },
    });
    const activeTextQs = await prisma.question.findMany({
      where: { isActive: true, type: 'TEXT_INPUT' },
      include: { acceptedAnswers: true },
    });
    const activeMCQs = await prisma.question.findMany({
      where: { isActive: true, type: 'MULTIPLE_CHOICE' },
      include: { options: true },
    });

    // Calculate required quotas
    const baseQuota = Math.floor(targetCount / 3);
    const remainder = targetCount % 3;

    let q1Quota = baseQuota + (remainder > 0 ? 1 : 0);
    let q2Quota = baseQuota + (remainder > 1 ? 1 : 0);
    let q3Quota = baseQuota;

    // Check availability
    if (activeTeamQs.length < q1Quota || activeTextQs.length < q2Quota || activeMCQs.length < q3Quota) {
      return res.status(400).json({
        error: {
          code: 'INSUFFICIENT_QUESTIONS',
          message: 'Недостаточно активных вопросов для начала конкурса. Обратитесь к организатору.',
        },
      });
    }

    // Random selection
    const selectedTeamQs = shuffle(activeTeamQs).slice(0, q1Quota);
    const selectedTextQs = shuffle(activeTextQs).slice(0, q2Quota);
    const selectedMCQs = shuffle(activeMCQs).slice(0, q3Quota);

    const combinedQuestions = shuffle([...selectedTeamQs, ...selectedTextQs, ...selectedMCQs]);

    // Transactional attempt creation
    const newAttempt = await prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.attempt.create({
        data: {
          participantToken,
          participantName: cleanName,
          questionCount: targetCount,
          status: 'IN_PROGRESS',
        },
      });

      const activeTeams = await tx.team.findMany({ where: { isActive: true } });

      for (let i = 0; i < combinedQuestions.length; i++) {
        const q = combinedQuestions[i];
        let snapshotData = {};

        if (q.type === 'TEAM_SELECTION') {
          snapshotData = {
            correctTeamId: q.correctTeamId,
            teams: activeTeams.map((t) => ({ id: t.id, name: t.name })),
          };
        } else if (q.type === 'TEXT_INPUT') {
          snapshotData = {
            acceptedAnswers: q.acceptedAnswers.map((a) => ({
              text: a.text,
              normalizedText: a.normalizedText,
            })),
          };
        } else if (q.type === 'MULTIPLE_CHOICE') {
          snapshotData = {
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          };
        }

        await tx.attemptQuestion.create({
          data: {
            attemptId: createdAttempt.id,
            questionId: q.id,
            position: i + 1,
            questionType: q.type,
            questionText: q.text,
            snapshotData: JSON.stringify(snapshotData),
          },
        });
      }

      return createdAttempt;
    });

    return res.json({ attempt: newAttempt });
    } catch (err) {
        const errorDetails = {
            name: err?.name || 'UnknownError',
            message: err?.message || String(err),
            code: err?.code || null,
            meta: err?.meta || null,
            clientVersion: err?.clientVersion || null,
            stack: err?.stack || null,
        };

        // Подробная ошибка в логах Render
        console.error(
            '[POST /api/attempts] Ошибка при создании игры:',
            JSON.stringify(errorDetails, null, 2)
        );

        const error = {
            code: 'SERVER_ERROR',
            message: 'Ошибка при создании игры',
        };

        // Включать только на время диагностики
        if (process.env.DEBUG_ERRORS === 'true') {
            error.details = {
                name: errorDetails.name,
                message: errorDetails.message,
                code: errorDetails.code,
                meta: errorDetails.meta,
            };
        }

        return res.status(500).json({ error });
    }
}

async function getAttemptDetails(req, res) {
  const { id } = req.params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { answers: true },
  });

  if (!attempt) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Попытка не найдена' } });
  }

  return res.json({
    id: attempt.id,
    status: attempt.status,
    participantName: attempt.participantName,
    questionCount: attempt.questionCount,
    answeredCount: attempt.answers.length,
    startedAt: attempt.startedAt,
  });
}

async function getAttemptQuestions(req, res) {
  const { id } = req.params;

  const attempt = await prisma.attempt.findUnique({ where: { id } });
  if (!attempt) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Попытка не найдена' } });
  }

  const attemptQuestions = await prisma.attemptQuestion.findMany({
    where: { attemptId: id },
    orderBy: { position: 'asc' },
  });

  const answers = await prisma.attemptAnswer.findMany({
    where: { attemptId: id },
  });

  const answerMap = {};
  answers.forEach((a) => {
    answerMap[a.questionId] = a;
  });

  // Strip sensitive metadata before sending to public client
  const safeQuestions = attemptQuestions.map((aq) => {
    const rawData = JSON.parse(aq.snapshotData);
    const existingAns = answerMap[aq.questionId];

    let safeOptions = null;
    if (aq.questionType === 'TEAM_SELECTION') {
      safeOptions = rawData.teams;
    } else if (aq.questionType === 'MULTIPLE_CHOICE') {
      safeOptions = rawData.options.map((o) => ({ id: o.id, text: o.text }));
    }

    return {
      questionId: aq.questionId,
      position: aq.position,
      type: aq.questionType,
      text: aq.questionText,
      options: safeOptions,
      userAnswer: existingAns
        ? {
            selectedTeamId: existingAns.selectedTeamId,
            textAnswer: existingAns.textAnswer,
            selectedOptionId: existingAns.selectedOptionId,
          }
        : null,
    };
  });

  return res.json({ questions: safeQuestions });
}

async function saveAnswer(req, res) {
  const { id, questionId } = req.params;
  const { type, teamId, textAnswer, optionId } = req.body;

  const attempt = await prisma.attempt.findUnique({ where: { id } });
  if (!attempt || attempt.status !== 'IN_PROGRESS') {
    return res.status(400).json({ error: { code: 'INVALID_ATTEMPT', message: 'Игра завершена или не найдена' } });
  }

  const aq = await prisma.attemptQuestion.findFirst({
    where: { attemptId: id, questionId },
  });

  if (!aq || aq.questionType !== type) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Несоответствие вопроса или типа' } });
  }

  const updateData = {
    selectedTeamId: null,
    textAnswer: null,
    selectedOptionId: null,
  };

  if (type === 'TEAM_SELECTION') {
    if (!teamId) return res.status(400).json({ error: { message: 'Укажите команду' } });
    updateData.selectedTeamId = teamId;
  } else if (type === 'TEXT_INPUT') {
    if (!textAnswer || textAnswer.trim().length === 0 || textAnswer.length > 200) {
      return res.status(400).json({ error: { message: 'Введите ответ длиной до 200 символов' } });
    }
    updateData.textAnswer = textAnswer.trim();
  } else if (type === 'MULTIPLE_CHOICE') {
    if (!optionId) return res.status(400).json({ error: { message: 'Выберите вариант' } });
    updateData.selectedOptionId = optionId;
  }

  await prisma.attemptAnswer.upsert({
    where: {
      attemptId_questionId: { attemptId: id, questionId },
    },
    update: updateData,
    create: {
      attemptId: id,
      questionId,
      ...updateData,
    },
  });

  return res.json({ success: true });
}

async function finishAttempt(req, res) {
  const { id } = req.params;

  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { attemptQuestions: true, answers: true },
  });

  if (!attempt) {
    return res.status(404).json({ error: { message: 'Попытка не найдена' } });
  }

  // Idempotent check
  if (attempt.status === 'COMPLETED') {
    return res.json({ success: true, score: attempt.score, durationSeconds: attempt.durationSeconds });
  }

  if (attempt.answers.length < attempt.questionCount) {
    return res.status(400).json({ error: { message: 'Ответьте на все вопросы перед завершением' } });
  }

  const finishedAt = new Date();
  const durationSeconds = Math.max(1, Math.floor((finishedAt - new Date(attempt.startedAt)) / 1000));

  let score = 0;
  const answerMap = {};
  attempt.answers.forEach((a) => (answerMap[a.questionId] = a));

  // Evaluate answers in background transaction
  await prisma.$transaction(async (tx) => {
    for (const aq of attempt.attemptQuestions) {
      const ans = answerMap[aq.questionId];
      const snapshot = JSON.parse(aq.snapshotData);
      let isCorrect = false;

      if (aq.questionType === 'TEAM_SELECTION') {
        if (ans.selectedTeamId === snapshot.correctTeamId) {
          isCorrect = true;
        }
      } else if (aq.questionType === 'TEXT_INPUT') {
        const normUser = normalizeText(ans.textAnswer);
        isCorrect = snapshot.acceptedAnswers.some((a) => a.normalizedText === normUser);
      } else if (aq.questionType === 'MULTIPLE_CHOICE') {
        const correctOpt = snapshot.options.find((o) => o.isCorrect);
        if (correctOpt && ans.selectedOptionId === correctOpt.id) {
          isCorrect = true;
        }
      }

      if (isCorrect) score++;

      await tx.attemptAnswer.update({
        where: { id: ans.id },
        data: { isCorrect },
      });
    }

    await tx.attempt.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finishedAt,
        durationSeconds,
        score,
      },
    });
  });

  return res.json({ success: true, score, durationSeconds });
}


async function getAttemptResult(req, res) {
    const { id } = req.params;

    const attempt = await prisma.attempt.findUnique({
        where: { id },
        include: {
            attemptQuestions: { orderBy: { position: 'asc' } },
            answers: true,
        },
    });

    if (!attempt || attempt.status !== 'COMPLETED') {
        return res.status(400).json({
            error: {
                message: 'Результат недоступен или конкурс не завершен',
            },
        });
    }

    // Получаем все завершённые попытки для определения места
    const completedAttempts = await prisma.attempt.findMany({
        where: { status: 'COMPLETED' },
        orderBy: [
            { score: 'desc' },
            { durationSeconds: 'asc' },
            { finishedAt: 'asc' },
        ],
        select: {
            id: true,
            score: true,
            durationSeconds: true,
            finishedAt: true,
        },
    });

    // Место участника в общем рейтинге
    const place = completedAttempts.findIndex((item) => item.id === id) + 1;

    const answerMap = {};
    attempt.answers.forEach((a) => {
        answerMap[a.questionId] = a;
    });

    const breakdown = attempt.attemptQuestions.map((aq) => {
        const ans = answerMap[aq.questionId];
        const snapshot = JSON.parse(aq.snapshotData);

        let userDisplay = '—';
        let correctDisplay = '';

        if (aq.questionType === 'TEAM_SELECTION') {
            const userTeam = snapshot.teams.find(
                (t) => t.id === ans?.selectedTeamId
            );
            const correctTeam = snapshot.teams.find(
                (t) => t.id === snapshot.correctTeamId
            );

            userDisplay = userTeam ? userTeam.name : 'Не выбрано';
            correctDisplay = correctTeam ? correctTeam.name : '—';
        } else if (aq.questionType === 'TEXT_INPUT') {
            userDisplay = ans?.textAnswer || '—';
            correctDisplay = snapshot.acceptedAnswers
                .map((a) => a.text)
                .join(' / ');
        } else if (aq.questionType === 'MULTIPLE_CHOICE') {
            const userOpt = snapshot.options.find(
                (o) => o.id === ans?.selectedOptionId
            );
            const correctOpt = snapshot.options.find((o) => o.isCorrect);

            userDisplay = userOpt ? userOpt.text : 'Не выбрано';
            correctDisplay = correctOpt ? correctOpt.text : '—';
        }

        return {
            position: aq.position,
            text: aq.questionText,
            type: aq.questionType,
            isCorrect: !!ans?.isCorrect,
            userAnswer: userDisplay,
            correctAnswer: correctDisplay,
        };
    });

    return res.json({
        participantName: attempt.participantName,
        score: attempt.score,
        questionCount: attempt.questionCount,
        durationSeconds: attempt.durationSeconds,
        place,
        breakdown,
    });
}


module.exports = {
  getOrCreateAttempt,
  getAttemptDetails,
  getAttemptQuestions,
  saveAnswer,
  finishAttempt,
  getAttemptResult,
};


