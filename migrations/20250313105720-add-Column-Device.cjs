/* eslint-disable linebreak-style */
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const table = await queryInterface.describeTable("Devices");
    if (!table["deviceNickName"]) {
      queryInterface.addColumn("Devices", "deviceNickName", {
        type: Sequelize.STRING,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     *
     */
    const table = await queryInterface.describeTable("Devices");
    if (table["deviceNickName"]) {
      await queryInterface.removeColumn("Devices", "deviceNickName");
    }
  },
};
