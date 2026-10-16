'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('defuse_steps', {
      step_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'player_id' },
        onDelete: 'CASCADE', // a step means nothing without its player
      },
      step_number: { type: Sequelize.SMALLINT, allowNull: false }, // 1 to 5 (one per wire)
      description: { type: Sequelize.STRING(255), allowNull: false },
      completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      completed_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addConstraint('defuse_steps', {
      type: 'unique',
      name: 'uq_player_step_number',
      fields: ['player_id', 'step_number'], // each step appears once per player
    });
    await queryInterface.addConstraint('defuse_steps', {
      type: 'check',
      name: 'ck_defuse_steps_number_range',
      fields: ['step_number'],
      where: { step_number: { [Sequelize.Op.between]: [1, 5] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('defuse_steps');
  },
};
