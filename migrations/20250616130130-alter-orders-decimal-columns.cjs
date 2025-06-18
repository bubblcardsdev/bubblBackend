/* eslint-disable linebreak-style */
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "totalPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn("Orders", "soldPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn("Orders", "discountAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });
   
  },

  async down(queryInterface, Sequelize) {
    // Optional: revert to INTEGER if needed
    await queryInterface.changeColumn("Orders", "totalPrice", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("Orders", "soldPrice", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn("Orders", "discountAmount", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn("Orders", "discountPercentage", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
