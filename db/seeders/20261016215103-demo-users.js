'use strict';

// All data here is fictitious: school IDs start with 2099 and emails end in .test
const FAKE_HASH = '$2b$10$demo.fictitious.hash.not.a.real.password.xxxxxxxxxxxxxxxxxx';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      { school_id: '2099-0001', username: 'teacher_host', full_name: 'Demo Host', email: 'host@demo.test', password_hash: FAKE_HASH, role: 'HOST' },
      { school_id: '2099-0002', username: 'rina', full_name: 'Rina Demo', email: 'rina@demo.test', password_hash: FAKE_HASH, role: 'PLAYER' },
      { school_id: '2099-0003', username: 'dale', full_name: 'Dale Demo', email: 'dale@demo.test', password_hash: FAKE_HASH, role: 'PLAYER' },
      { school_id: '2099-0004', username: 'pao', full_name: 'Pao Demo', email: 'pao@demo.test', password_hash: FAKE_HASH, role: 'PLAYER' },
      { school_id: '2099-0005', username: 'lito', full_name: 'Lito Demo', email: 'lito@demo.test', password_hash: FAKE_HASH, role: 'PLAYER' },
      // awkward case: an account that never joined any game
      { school_id: '2099-0006', username: 'mara', full_name: 'Mara Demo', email: 'mara@demo.test', password_hash: FAKE_HASH, role: 'PLAYER' },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: { [require('sequelize').Op.like]: '%@demo.test' } }, {});
  },
};
