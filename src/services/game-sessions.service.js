const gameSessionsRepository = require('../repositories/game-sessions.repository');

async function listGameSessions() {
  return gameSessionsRepository.findAll();
}

module.exports = { listGameSessions };
