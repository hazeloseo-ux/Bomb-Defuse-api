// Hub Contract rule 7: one row per player per FINISHED game (status CLOSED).
// "completed" in this game: the player answered every question of the game's question set.
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findFinishedGamePlayers(since) {
  const sql = `
    SELECT s.join_code AS session_code, s.started_at, s.ended_at,
           u.school_id, p.nickname, p.score,
           (
             (SELECT COUNT(*) FROM questions q WHERE q.question_set_id = s.question_set_id) > 0
             AND
             (SELECT COUNT(DISTINCT a.question_id) FROM answers a WHERE a.player_id = p.player_id)
               = (SELECT COUNT(*) FROM questions q WHERE q.question_set_id = s.question_set_id)
           ) AS completed
      FROM game_sessions s
      JOIN players p ON p.session_id = s.session_id
      JOIN users u ON u.user_id = p.user_id
     WHERE s.status = 'CLOSED'
       AND (CAST(:since AS timestamptz) IS NULL OR s.ended_at > CAST(:since AS timestamptz))
     ORDER BY s.ended_at, p.score DESC, p.nickname
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: { since: since ? since.toISOString() : null },
  });
}

module.exports = { findFinishedGamePlayers };