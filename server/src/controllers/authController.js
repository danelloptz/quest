const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function login(req, res) {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Заполните логин и пароль' } });
  }

  const admin = await prisma.admin.findUnique({ where: { login } });
  if (!admin) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Неверный логин или пароль' } });
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Неверный логин или пароль' } });
  }

  const token = jwt.sign({ id: admin.id, login: admin.login }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h',
  });

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
});

  return res.json({ success: true, admin: { id: admin.id, login: admin.login } });
}

async function logout(req, res) {
  res.clearCookie('admin_token');
  return res.json({ success: true });
}

async function me(req, res) {
  return res.json({ admin: req.admin });
}

module.exports = { login, logout, me };
