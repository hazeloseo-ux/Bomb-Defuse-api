// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const leaderboardService = require('../services/leaderboard.service');

async function top(req, res) {
  const { code, limit = 10 } = matchedData(req);
  const players = await leaderboardService.top(code, limit);
  res.status(200).json(players);
}

module.exports = { top };