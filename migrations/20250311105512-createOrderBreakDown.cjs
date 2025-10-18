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
        allowNull: true,
        references: {
          model: "CustomFontMasters",
          key: "id",
        },
      },
      customName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      originalPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
      discountedPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
      discountPercentage: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      discountedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      sellingPrice: {
        type: Sequelize.DECIMAL(10, 2),
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
