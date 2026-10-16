'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('question_sets', {
      question_set_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'RESTRICT', // do not lose a host's question sets by deleting the account
      },
      title: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('question_sets');
  },
};