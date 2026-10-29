const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Сессия истекла или недействительна' } });
  }
}

module.exports = { requireAdmin };