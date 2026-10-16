   'use strict';

   /** @type {import('sequelize-cli').Migration} */
   module.exports = {
     async up(queryInterface, Sequelize) {
       await queryInterface.addColumn('users', 'full_name', {
         type: Sequelize.STRING(100),
         allowNull: false,
         defaultValue: 'Unnamed', // lets the column be added to any existing rows
       });
       await queryInterface.sequelize.query('ALTER TABLE users ALTER COLUMN full_name DROP DEFAULT');
     },

     async down(queryInterface) {
       await queryInterface.removeColumn('users', 'full_name');
     },
   };