const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin Account
  const adminLogin = process.env.ADMIN_LOGIN || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { login: adminLogin },
    update: { passwordHash },
    create: {
      login: adminLogin,
      passwordHash,
    },
  });

  // Settings
  const settings = await prisma.contestSettings.findFirst();
  if (!settings) {
    await prisma.contestSettings.create({
      data: { questionCount: 12 },
    });
  }

  // Seed Teams
  const teamNames = ['Пчёлки СПб', 'Эйс СПб', 'Ярославль', 'Петрозаводск', 'Зенит Казань', 'Локомотив'];
  const teamsMap = {};

  for (const name of teamNames) {
    const team = await prisma.team.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
    teamsMap[name] = team.id;
  }

  // Seed Players
  const playersData = [
    { firstName: 'Иван', lastName: 'Петров', team: 'Пчёлки СПб' },
    { firstName: 'Алексей', lastName: 'Иванов', team: 'Пчёлки СПб' },
    { firstName: 'Дмитрий', lastName: 'Смирнов', team: 'Эйс СПб' },
    { firstName: 'Максим', lastName: 'Сидоров', team: 'Эйс СПб' },
    { firstName: 'Сергей', lastName: 'Козлов', team: 'Ярославль' },
    { firstName: 'Артем', lastName: 'Морозов', team: 'Петрозаводск' },
  ];

  for (const p of playersData) {
    const existing = await prisma.player.findFirst({
      where: { firstName: p.firstName, lastName: p.lastName, teamId: teamsMap[p.team] }
    });
    if (!existing) {
      await prisma.player.create({
        data: {
          firstName: p.firstName,
          lastName: p.lastName,
          teamId: teamsMap[p.team],
        },
      });
    }
  }

  // Helper function to normalize
  const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ');

  // Questions Seed
  const countQuestions = await prisma.question.count();
  if (countQuestions === 0) {
    // 1. Team Selection Questions
    const teamQuestions = [
      { text: 'В составе этой команды есть игрок, который в детстве 7 лет занимался плаванием.', correctTeam: 'Пчёлки СПб' },
      { text: 'Эта команда выиграла региональный турнир прошлым летом без единого поражения.', correctTeam: 'Эйс СПб' },
      { text: 'Команда, капитан которой является самым высоким связующим турнира (202 см).', correctTeam: 'Ярославль' },
      { text: 'Самая молодая команда турнира по среднему возрасту игроков (21 год).', correctTeam: 'Петрозаводск' },
    ];

    for (const q of teamQuestions) {
      await prisma.question.create({
        data: {
          type: 'TEAM_SELECTION',
          text: q.text,
          correctTeamId: teamsMap[q.correctTeam],
          isActive: true,
        },
      });
    }

    // 2. Text Input Questions
    const textQuestions = [
      { text: 'Как зовут игрока, который в детстве 7 лет занимался плаванием?', answers: ['Иван Петров', 'Петров', 'Иван'] },
      { text: 'Назовите фамилию главного тренера команды "Зенит Казань"?', answers: ['Алекно', 'Владимир Алекно'] },
      { text: 'Какой кодовый термин используется для обозначения скидки прямо за блок?', answers: ['Накат', 'Скидка'] },
      { text: 'Как называется позиция игрока, выполняющего исключительно защитные функции?', answers: ['Либеро'] },
    ];

    for (const q of textQuestions) {
      const createdQ = await prisma.question.create({
        data: {
          type: 'TEXT_INPUT',
          text: q.text,
          isActive: true,
        },
      });
      for (const ans of q.answers) {
        await prisma.questionAcceptedAnswer.create({
          data: {
            questionId: createdQ.id,
            text: ans,
            normalizedText: normalize(ans),
          },
        });
      }
    }

    // 3. Multiple Choice Questions
    const mcQuestions = [
      {
        text: 'Какой вид спорта Иван Петров освоил до того, как начал заниматься волейболом?',
        options: [
          { text: 'Плавание', isCorrect: true },
          { text: 'Баскетбол', isCorrect: false },
          { text: 'Теннис', isCorrect: false },
          { text: 'Лёгкая атлетика', isCorrect: false },
        ],
      },
      {
        text: 'Сколько касаний мяча одной командой максимально разрешено на одной стороне?',
        options: [
          { text: '2 касания', isCorrect: false },
          { text: '3 касания', isCorrect: true },
          { text: '4 касания', isCorrect: false },
          { text: 'Не ограничено', isCorrect: false },
        ],
      },
      {
        text: 'Высота волейбольной сетки для мужских соревнований составляет:',
        options: [
          { text: '2.43 м', isCorrect: true },
          { text: '2.24 м', isCorrect: false },
          { text: '2.50 м', isCorrect: false },
          { text: '2.35 м', isCorrect: false },
        ],
      },
      {
        text: 'Сколько игроков одной команды одновременно находятся на площадке?',
        options: [
          { text: '5 игроков', isCorrect: false },
          { text: '6 игроков', isCorrect: true },
          { text: '7 игроков', isCorrect: false },
          { text: '8 игроков', isCorrect: false },
        ],
      },
    ];

    for (const q of mcQuestions) {
      const createdQ = await prisma.question.create({
        data: {
          type: 'MULTIPLE_CHOICE',
          text: q.text,
          isActive: true,
        },
      });
      for (const opt of q.options) {
        await prisma.questionOption.create({
          data: {
            questionId: createdQ.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
