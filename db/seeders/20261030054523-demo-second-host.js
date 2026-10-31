'use strict';

// Fictitious second host, used to prove that one host cannot change another host's question set.
const FAKE_HASH = '$2b$10$demo.fictitious.hash.not.a.real.password.xxxxxxxxxxxxxxxxxx';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      { school_id: '2099-0007', username: 'second_host', full_name: 'Second Host', email: 'host2@demo.test', password_hash: FAKE_HASH, role: 'HOST' },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { school_id: '2099-0007' }, {});
  },
};