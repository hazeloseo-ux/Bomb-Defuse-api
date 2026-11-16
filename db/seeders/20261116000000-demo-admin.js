'use strict';
const bcrypt = require('bcryptjs');

// Local demo admin only. The live server gets its admin from create-admin.js.
// Same demo password as demo-passwords.js, 8-72 characters with a letter and a number.
const DEMO_PASSWORD = 'oseo2525';

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    // ON CONFLICT DO NOTHING: running the seeder again changes nothing.
    await queryInterface.sequelize.query(
      `INSERT INTO users (school_id, username, full_name, email, password_hash, role)
       VALUES ('2099-0000', 'admin_demo', 'Demo Admin', 'admin@demo.test', :hash, 'ADMIN')
       ON CONFLICT DO NOTHING`,
      { replacements: { hash } }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@demo.test' }, {});
  },
};