'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'ck_users_role_valid');
    await queryInterface.addConstraint('users', {
      type: 'check',
      name: 'ck_users_role_valid',
      fields: ['role'],
      where: { role: { [Sequelize.Op.in]: ['HOST', 'PLAYER', 'ADMIN'] } },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("UPDATE users SET role = 'HOST' WHERE role = 'ADMIN'");
    await queryInterface.removeConstraint('users', 'ck_users_role_valid');
    await queryInterface.addConstraint('users', {
      type: 'check',
      name: 'ck_users_role_valid',
      fields: ['role'],
      where: { role: { [Sequelize.Op.in]: ['HOST', 'PLAYER'] } },
    });
  },
};