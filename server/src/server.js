const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
    'http://localhost:5173',
    'https://danelloptz.github.io',
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.options(/.*/, cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attempts', attemptRoutes);

// General Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Произошла внутренняя ошибка сервера' } });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
