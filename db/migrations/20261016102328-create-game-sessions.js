'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_sessions', {
      session_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'RESTRICT',
      },
      question_set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'question_set_id' },
        onDelete: 'RESTRICT', // a finished game must keep its questions
      },
      join_code: { type: Sequelize.STRING(6), allowNull: false, unique: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'WAITING' },
      time_limit_seconds: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 300 },
      started_at: { type: Sequelize.DATE, allowNull: true },
      ended_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });

    await queryInterface.addConstraint('game_sessions', {
      type: 'check',
      name: 'ck_game_sessions_status_valid',
      fields: ['status'],
      where: { status: { [Sequelize.Op.in]: ['WAITING', 'IN_PROGRESS', 'CLOSED'] } },
    });
    await queryInterface.addConstraint('game_sessions', {
      type: 'check',
      name: 'ck_game_sessions_time_limit_positive',
      fields: ['time_limit_seconds'],
      where: { time_limit_seconds: { [Sequelize.Op.gt]: 0 } },
    });
    // join code is exactly six digits
    await queryInterface.sequelize.query(
      "ALTER TABLE game_sessions ADD CONSTRAINT ck_game_sessions_join_code_six_digits CHECK (join_code ~ '^[0-9]{6}$')"
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('game_sessions');
  },
};