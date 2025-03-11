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
    await queryInterface.addColumn("Carts", "nameCustomNameOnCard", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Carts", "fontId", {
      type: Sequelize.INTEGER,
      references: {
        model: "CustomFontMasters",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Carts", "productId");
    await queryInterface.removeColumn("Carts", "nameCustomFontStyle");
    await queryInterface.removeColumn("Carts", "nameCustomNameOnCard");
     await queryInterface.removeColumn("Carts", "fontId");
  },
};
