// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const authService = require('../services/auth.service');

// What a client is allowed to see of an account. The hash is never listed here.
function toJson(user) {
  return {
    id: user.user_id,
    school_id: user.school_id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

async function register(req, res) {
  // Only fields that have a rule come out: a "role" in the body is dropped here.
  const data = matchedData(req, { locations: ['body'] });
  const user = await authService.register(data);
  res.status(201).json({ user: toJson(user) });
}

async function login(req, res) {
  const data = matchedData(req, { locations: ['body'] });
  const result = await authService.login(data);
  res.status(200).json({ ...result, user: toJson(result.user) });
}

// currentUser already loaded the account from the token.
async function me(req, res) {
  res.status(200).json({ user: toJson(req.account) });
}

module.exports = { register, login, me };