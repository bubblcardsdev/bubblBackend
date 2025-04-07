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
    await queryInterface.addColumn("Orders", "email", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Orders", "discountPercentage", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Orders", "discountAmount", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Orders", "soldPrice", {
      type: Sequelize.INTEGER,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "productUUId");
    await queryInterface.removeColumn("Orders", "email");
    await queryInterface.removeColumn("Orders", "discountPercentage");
    await queryInterface.removeColumn("Orders", "discountAmount");
    await queryInterface.removeColumn("Orders", "discountAmount");
  },
};
