"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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

    await queryInterface.addColumn("Orders", "shippingCharge", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Orders", "fontId", {
      type: Sequelize.INTEGER,
      references: {
        model: "CustomFontMasters",
        key: "id",
      },
    });
    await queryInterface.addColumn("Orders", "nameOnCard", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "orderStatusId");
    await queryInterface.removeColumn("Orders", "isLoggedIn");
    await queryInterface.removeColumn("Orders", "shippingCharge");
    await queryInterface.removeColumn("Orders", "fontId");
    await queryInterface.removeColumn("Orders", "nameOnCard");
  },
};
