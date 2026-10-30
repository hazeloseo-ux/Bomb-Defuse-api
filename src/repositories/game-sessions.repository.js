const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findAll() {
  const sql = `
    SELECT session_id, host_id, question_set_id, join_code, status,
           time_limit_seconds, started_at, ended_at, created_at
      FROM game_sessions
     ORDER BY created_at DESC, session_id DESC
  `;

  return sequelize.query(sql, { type: QueryTypes.SELECT });
}

module.exports = { findAll };
