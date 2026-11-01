// Three steps: read validated input, call one service, choose the status.
const { matchedData } = require('express-validator');
const playerService = require('../services/player.service');

// What a client is allowed to see of a player.
function toJson(player) {
  return {
    player_id: player.player_id,
    nickname: player.nickname,
    score: player.score,
    defuse_progress: player.defuse_progress,
    mistakes: player.mistakes,
    joined_at: player.joined_at,
  };
}

// 201 for a new seat, 200 for the same seat back.
async function join(req, res) {
  const { code, nickname } = matchedData(req);
  const { session, player, created } = await playerService.join(code, nickname, req.user);
  res.status(created ? 201 : 200).json({
    ...toJson(player),
    rejoined: !created,
    session: { code: session.join_code, status: session.status },
  });
}

async function list(req, res) {
  const { code } = matchedData(req);
  const players = await playerService.list(code);
  res.status(200).json(players.map(toJson));
}

module.exports = { join, list };