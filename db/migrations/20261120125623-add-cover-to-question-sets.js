'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Nullable: a set has no cover until its owner uploads one.
    await queryInterface.addColumn('question_sets', 'cover_filename', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('question_sets', 'cover_filename');
  },
};