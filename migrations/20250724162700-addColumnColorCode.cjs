"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("DeviceColorMasters");

    if (!table["colorCode"]) {
      queryInterface.addColumn("DeviceColorMasters", "colorCode", {
        type: Sequelize.STRING,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("DeviceColorMasters");

    if (table["colorCode"]) {
      await queryInterface.removeColumn("DeviceColorMasters", "colorCode");
    }
  },
};
