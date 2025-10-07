"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("DeviceTypeMasters"); 

    if (!table["isActive"]) {
      await queryInterface.addColumn("DeviceTypeMasters", "version", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      });
    }
  },


  async down(queryInterface) {
    const table = await queryInterface.describeTable("DeviceTypeMasters");

    if (table["version"]) {
      await queryInterface.removeColumn("DeviceTypeMasters", "version");
    }

  },
};
