"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable("Modes");
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Modes");
  },
};
