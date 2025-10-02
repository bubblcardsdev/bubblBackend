"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("DeviceInventories"); 

    if (!table["isActive"]) {
      await queryInterface.addColumn("DeviceInventories", "isActive", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },


  async down(queryInterface) {
    const table = await queryInterface.describeTable("DeviceInventories");

    if (table["isActive"]) {
      await queryInterface.removeColumn("DeviceInventories", "isActive");
    }

  },
};
