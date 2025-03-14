"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("DeviceInventories", "productId", {
      type: Sequelize.UUID,
      unique: true,
    });
    await queryInterface.addColumn("Carts", "productUUId", {
      type: Sequelize.UUID,
      references: {
        model: "DeviceInventories",
        key: "productId",
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
    await queryInterface.removeColumn("Carts", "productUUId");
    await queryInterface.removeColumn("Carts", "nameCustomFontStyle");
    await queryInterface.removeColumn("Carts", "nameCustomNameOnCard");
    await queryInterface.removeColumn("Carts", "fontId");
  },
};
