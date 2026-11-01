// The only file that queries game_sessions. No rules, no status codes.
const { GameSession } = require('../models');

function findAllByHost(hostId) {
  return GameSession.findAll({
    where: { host_id: hostId },
    order: [['session_id', 'DESC']],
  });
}

function findByCode(code) {
  return GameSession.findOne({ where: { join_code: code } }); // a row, or null
}

async function codeExists(code) {
  const count = await GameSession.count({ where: { join_code: code } });
  return count > 0;
}

function create(data) {
  return GameSession.create(data);
}

function update(session, changes) {
  return session.update(changes);
}

module.exports = { findAllByHost, findByCode, codeExists, create, update };