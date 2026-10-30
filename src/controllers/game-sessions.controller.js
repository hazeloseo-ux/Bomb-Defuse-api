// Translates between HTTP and the service. No SQL, no business rules.
const gameSessionsService = require('../services/game-sessions.service');

async function listGameSessions(req, res) {
  const sessions = await gameSessionsService.listGameSessions();
  res.status(200).json(sessions);
}

module.exports = { listGameSessions };
