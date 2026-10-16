'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      player_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'game_sessions', key: 'session_id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'RESTRICT',
      },
      nickname: { type: Sequelize.STRING(50), allowNull: false },
      score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      defuse_progress: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, // successful cuts, 0 to 5
      mistakes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },        // failed cuts, 0 to 3
      joined_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });

    await queryInterface.addConstraint('players', {
      type: 'unique',
      name: 'uq_one_seat',
      fields: ['session_id', 'user_id'], // one seat per account per game
    });
    await queryInterface.addConstraint('players', {
      type: 'unique',
      name: 'uq_player_nickname',
      fields: ['session_id', 'nickname'],
    });
    await queryInterface.addConstraint('players', {
      type: 'check',
      name: 'ck_players_score_not_negative',
      fields: ['score'],
      where: { score: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.addConstraint('players', {
      type: 'check',
      name: 'ck_players_defuse_progress_range',
      fields: ['defuse_progress'],
      where: { defuse_progress: { [Sequelize.Op.between]: [0, 5] } },
    });
    await queryInterface.addConstraint('players', {
      type: 'check',
      name: 'ck_players_mistakes_range',
      fields: ['mistakes'],
      where: { mistakes: { [Sequelize.Op.between]: [0, 3] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('players');
  },
};