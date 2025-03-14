"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "productUUId", {
      type: Sequelize.UUID,
      references: {
        model: "DeviceInventories",
        key: "productId",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "productUUId");
  },
};
