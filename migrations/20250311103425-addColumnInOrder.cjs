"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "email", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Orders", "discountAmount", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Orders", "shippingCharge", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Orders", "soldPrice", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Orders", "orderStatusId", {
      type: Sequelize.INTEGER,
      references: {
        model: "OrderStatusMasters",
        key: "id",
      },
    });
    await queryInterface.addColumn("Orders", "isLoggedIn", {
      type: Sequelize.BOOLEAN,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "orderStatusId");
    await queryInterface.removeColumn("Orders", "isLoggedIn");
    await queryInterface.removeColumn("Orders", "shippingCharges");
    await queryInterface.removeColumn("Orders", "email");
    await queryInterface.removeColumn("Orders", "discountAmount");
    await queryInterface.removeColumn("Orders", "soldPrice");
  },
};
