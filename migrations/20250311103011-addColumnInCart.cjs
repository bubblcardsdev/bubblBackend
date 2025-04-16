"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Carts", "productId", {
      type: Sequelize.INTEGER,
      references: {
        model: "DeviceInventories",
        key: "id",
      },
    });
    await queryInterface.addColumn("Carts", "customName", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Carts", "fontId", {
      type: Sequelize.INTEGER,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Carts", "productId");
    await queryInterface.removeColumn("Carts", "customName");
    await queryInterface.removeColumn("Carts", "fontId");
  },
};
