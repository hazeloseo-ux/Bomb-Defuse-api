'use strict';

module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;
    const [[host]] = await db.query("SELECT user_id FROM users WHERE school_id = '2099-0001'");

    await queryInterface.bulkInsert('question_sets', [{
      host_id: host.user_id,
      title: 'Demo Bomb Defuse Basics',
      description: 'Fictitious demo questions for the seed data.',
    }]);
    const [[set]] = await db.query("SELECT question_set_id FROM question_sets WHERE title = 'Demo Bomb Defuse Basics'");

    // five tool-earning questions and five wire-cutting questions
    const rows = [];
    for (let i = 1; i <= 5; i++) {
      rows.push({
        question_set_id: set.question_set_id, question_type: 'TOOL',
        question_text: `Tool question ${i}: which answer is correct?`,
        choice_a: 'Option A', choice_b: 'Option B', choice_c: 'Option C', choice_d: 'Option D',
        correct_index: i % 4,
      });
      rows.push({
        question_set_id: set.question_set_id, question_type: 'CUT',
        question_text: `Wire question ${i}: which answer is correct?`,
        choice_a: 'Option A', choice_b: 'Option B', choice_c: 'Option C', choice_d: 'Option D',
        correct_index: (i + 1) % 4,
      });
    }
    await queryInterface.bulkInsert('questions', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('question_sets', { title: 'Demo Bomb Defuse Basics' }, {});
  },
};
