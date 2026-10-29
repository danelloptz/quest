const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Список явно разрешенных origins
const allowedOrigins = [
  'https://danelloptz.github.io',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

// Блокируем падение сервера при необработанных ошибках
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Кастомный middleware CORS: надежно проставляет заголовки даже при 500/502 ошибках
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Разрешаем origin, если он в списке или подходит по шаблону (github.io, vercel, onrender)
  const isAllowed = !origin || 
    allowedOrigins.includes(origin) || 
    origin.endsWith('.github.io') || 
    origin.endsWith('.vercel.app') || 
    origin.endsWith('.onrender.com');

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  // Ответ на preflight OPTIONS запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// API-маршруты
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attempts', attemptRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } });
});

// Глобальная обработка ошибок (гарантирует отдачу JSON вместо 502/HTML)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Произошла внутренняя ошибка сервера',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});