"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable("DeviceImageInventories");
    await queryInterface.dropTable("DeviceInventories");
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("DeviceImageInventories");
    await queryInterface.dropTable("DeviceInventories");
  },
};
