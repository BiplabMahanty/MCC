const authService = require('../services/auth.service');

async function login(req, res) {
  const session = await authService.login(req.body);
  res.status(200).json(session);
}

async function refresh(req, res) {
  const session = await authService.refreshSession(req.body.refreshToken);
  res.status(200).json(session);
}

async function logout(req, res) {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
}

function me(req, res) {
  res.status(200).json({ user: req.user.toJSON() });
}

module.exports = {
  login,
  logout,
  me,
  refresh,
};
