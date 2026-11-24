'use strict';

module.exports = {
  async up(queryInterface) {
    // A player answers a question once. The database decides, even for two requests at the same instant.
    await queryInterface.addConstraint('answers', {
      type: 'unique',
      name: 'uq_one_answer',
      fields: ['player_id', 'question_id'],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('answers', 'uq_one_answer');
  },
};