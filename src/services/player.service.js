// The rules for joining a game. The order of the questions is part of the design.
const playerRepository = require('../repositories/player.repository');
const gameSessionsService = require('./game-sessions.service');
const { conflict } = require('../errors/app-error');
const { constraintOf } = require('../errors/db-errors');

async function join(code, nickname, user) {
  // 1. Does a game with this code exist?
  const session = await gameSessionsService.findOrFail(code);

  // 2. Rejoin: this account already has a seat. Same row, same score.
  const seat = await playerRepository.findSeat(session.session_id, user.user_id);
  if (seat) return { session, player: seat, created: false };

  // 3. One game at a time: a seat in ANOTHER game that is IN_PROGRESS.
  const elsewhere = await playerRepository.findRunningSeatElsewhere(
    user.user_id,
    session.session_id
  );
  if (elsewhere) {
    throw conflict('ALREADY_IN_GAME', 'You are still playing another game. Finish it first.');
  }

  // 4. A new seat is only possible while the game is waiting.
  if (session.status === 'CLOSED') {
    throw conflict('SESSION_ENDED', 'This game has ended.');
  }
  if (session.status !== 'WAITING') {
    throw conflict('SESSION_NOT_JOINABLE', 'This game has already started.');
  }

  // 5. Is the nickname free? Only the database can decide between two requests
  //    that arrive together, so uq_player_nickname answers (see constraint-map.js).
  try {
    const player = await playerRepository.create({
      session_id: session.session_id,
      user_id: user.user_id,
      nickname,
    });
    return { session, player, created: true };
  } catch (error) {
    // Two joins from the same account at the same instant: the second one is a rejoin.
    if (constraintOf(error) === 'uq_one_seat') {
      const existing = await playerRepository.findSeat(session.session_id, user.user_id);
      return { session, player: existing, created: false };
    }
    throw error;
  }
}

async function list(code) {
  const session = await gameSessionsService.findOrFail(code);
  return playerRepository.findAllBySession(session.session_id);
}

module.exports = { join, list };