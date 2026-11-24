// The only file that queries players. No rules, no status codes.
const { Op } = require('sequelize');
const { Player, GameSession } = require('../models');

// This account's seat in this game, or null.
function findSeat(sessionId, userId, options = {}) {
  return Player.findOne({ where: { session_id: sessionId, user_id: userId }, ...options });
}

// A seat of this account in ANOTHER game that is IN_PROGRESS, or null.
function findRunningSeatElsewhere(userId, sessionId) {
  return Player.findOne({
    where: { user_id: userId, session_id: { [Op.ne]: sessionId } },
    include: [{
      model: GameSession,
      where: { status: 'IN_PROGRESS' },
      attributes: ['join_code'],
      required: true,
    }],
  });
}

function create(data) {
  return Player.create(data);
}

function findAllBySession(sessionId) {
  return Player.findAll({
    where: { session_id: sessionId },
    order: [['score', 'DESC'], ['player_id', 'ASC']],
  });
}

// Adds points in the database itself (score = score + n), so two answers never overwrite each other.
function addScore(player, points, options = {}) {
  return player.increment('score', { by: points, ...options });
}

module.exports = { findSeat, findRunningSeatElsewhere, create, findAllBySession, addScore };