// The rules for the leaderboard: any game can be looked at, equal scores share a rank (1, 1, 3 ...).
const gameSessionsService = require('./game-sessions.service');
const playerRepository = require('../repositories/player.repository');

async function top(code, limit = 10) {
  const session = await gameSessionsService.findOrFail(code);
  const players = await playerRepository.findTopBySession(session.session_id, limit);

  let rank = 0;
  let previous = null;
  return players.map((player, index) => {
    if (player.score !== previous) rank = index + 1;
    previous = player.score;
    return {
      rank,
      player_id: player.player_id,
      nickname: player.nickname,
      score: player.score,
    };
  });
}

module.exports = { top };