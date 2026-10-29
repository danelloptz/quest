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
    'https://danelloptz.github.io',
    'http://localhost:5173',
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error(`CORS blocked origin: ${origin}`);
        return callback(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
};

// CORS должен выполняться до маршрутов и обработчика ошибок
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attempts', attemptRoutes);

app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);

    if (err.message?.startsWith('Origin not allowed:')) {
        return res.status(403).json({
            error: {
                code: 'CORS_ERROR',
                message: 'Origin not allowed',
            },
        });
    }

    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Произошла внутренняя ошибка сервера',
        },
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});