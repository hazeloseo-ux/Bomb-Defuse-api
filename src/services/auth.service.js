const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const password = require('../security/password');
const token = require('../security/token');
const { unauthorized } = require('../errors/app-error');

// Always a PLAYER: role is not an input here at all.
async function register({ school_id, full_name, email, password: plain }) {
  const password_hash = await password.hash(plain);
  return userRepository.create({ school_id, full_name, email, password_hash, role: 'PLAYER' });
}

async function login({ school_id, password: plain }) {
  const user = await userRepository.findForLogin(school_id);

  // Runs even when user is null (the kit compares against a dummy hash),
  // so both failures take the same time and give the same answer.
  const ok = await password.matches(plain, user ? user.password_hash : null);
  if (!ok) throw unauthorized('School ID or password is wrong.', 'INVALID_CREDENTIALS');

  const signed = token.issue(user);
  const { iat, exp } = jwt.decode(signed);
  return { token: signed, token_type: 'Bearer', expires_in: exp - iat, user };
}

module.exports = { register, login };