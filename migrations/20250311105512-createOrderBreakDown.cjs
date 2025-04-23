"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderBreakDowns", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Orders",
          key: "id",
        },
      },
      productId: {
        type: Sequelize.INTEGER,
        references: {
          model: "DeviceInventories",
          key: "id",
        },
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      fontId: {
        type: Sequelize.INTEGER,
      },
      customName: {
        type: Sequelize.STRING,
      },
      originalPrice: {
        type: Sequelize.INTEGER,
      },
      discountedPrice: {
        type: Sequelize.INTEGER,
      },
      discountPercentage: {
        type: Sequelize.INTEGER,
      },
      discountedAmount: {
        type: Sequelize.INTEGER,
      },
      sellingPrice: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("OrderBreakDowns");
  },
};
