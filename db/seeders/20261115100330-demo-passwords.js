'use strict';
const bcrypt = require('bcryptjs');

// Demo password ng lahat ng seeded accounts (local lang). Palitan ng sarili mo.
// 8-72 characters, may letra at numero.
const DEMO_PASSWORD = 'oseo2525';

const FAKE_PATTERN = '$2b$10$demo.fictitious%';
const FAKE_HASH = '$2b$10$demo.fictitious.hash.not.a.real.password.xxxxxxxxxxxxxxxxxx';

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    // Pinapalitan lang ang mga FAKE_HASH, kaya walang nagbabago kapag inulit.
    await queryInterface.sequelize.query(
      'UPDATE users SET password_hash = :hash WHERE password_hash LIKE :pattern',
      { replacements: { hash, pattern: FAKE_PATTERN } }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "UPDATE users SET password_hash = :fake WHERE school_id LIKE '2099-%'",
      { replacements: { fake: FAKE_HASH } }
    );
  },
};