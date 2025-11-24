"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PlanOrders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      planId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      planType: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      soldPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      orderStatusId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      razorpayOrderID: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PlanOrders");
  },
};

