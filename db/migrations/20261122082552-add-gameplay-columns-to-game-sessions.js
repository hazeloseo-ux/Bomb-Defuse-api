'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Both are empty until the host starts the game.
    await queryInterface.addColumn('game_sessions', 'current_position', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('game_sessions', 'question_started_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('game_sessions', 'question_started_at');
    await queryInterface.removeColumn('game_sessions', 'current_position');
  },
};