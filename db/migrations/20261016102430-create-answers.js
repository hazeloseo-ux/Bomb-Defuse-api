'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      answer_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'player_id' },
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'question_id' },
        onDelete: 'RESTRICT',
      },
      choice_index: { type: Sequelize.SMALLINT, allowNull: false },
      correct: { type: Sequelize.BOOLEAN, allowNull: false },
      points: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      answered_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });

    await queryInterface.addConstraint('answers', {
      type: 'check',
      name: 'ck_answers_choice_index_range',
      fields: ['choice_index'],
      where: { choice_index: { [Sequelize.Op.between]: [0, 3] } },
    });
    await queryInterface.addConstraint('answers', {
      type: 'check',
      name: 'ck_answers_points_not_negative',
      fields: ['points'],
      where: { points: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('answers');
  },
};