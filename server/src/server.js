const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Разрешённые источники
const allowedOrigins = [
  'https://danelloptz.github.io',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL, // Позволяет задавать URL фронтенда через переменную окружения в Render
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Разрешаем запросы без Origin (например, curl, Postman, мобильные приложения)
    if (!origin) return callback(null, true);

    // Если точно совпадает с разрешенным списком
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Если это поддомен github.io или vercel.app (опционально, для удобства тестирования)
    if (origin.endsWith('.github.io') || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    console.error(`[CORS Blocked] Origin: ${origin}`);
    return callback(new Error(`Origin not allowed: ${origin}`));
  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],

  optionsSuccessStatus: 200,
};

// 1. Включаем CORS middleware для всех маршрутов
app.use(cors(corsOptions));

// 2. Обработка всех OPTIONS предзапросов
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// API-маршруты
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attempts', attemptRoutes);

// Обработка 404
app.use((req, res, next) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);

  if (err.message && err.message.startsWith('Origin not allowed:')) {
    return res.status(403).json({
      error: {
        code: 'CORS_ERROR',
        message: 'Origin not allowed',
      },
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Произошла внутренняя ошибка сервера',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});