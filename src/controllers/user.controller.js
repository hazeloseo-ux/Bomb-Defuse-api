// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const userService = require('../services/user.service');

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

async function list(req, res) {
  const users = await userService.list();
  res.status(200).json({ users: users.map(toJson) });
}

async function changeRole(req, res) {
  const { id, role } = matchedData(req);
  const user = await userService.changeRole(id, role, req.user);
  res.status(200).json({ user: toJson(user) });
}

module.exports = { list, changeRole };
