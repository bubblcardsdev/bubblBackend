'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Profiles', {
      fields: ['userId', 'profileName'],
      type: 'unique',
      name: 'unique_userId_profileName' // custom name for the constraint
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Profiles', 'unique_userId_profileName');
  }
};
