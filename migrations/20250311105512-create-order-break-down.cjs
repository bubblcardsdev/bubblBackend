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
      fontId: {
        type: Sequelize.INTEGER,
        references: {
          model: "CustomFontMasters",
          key: "id",
        },
      },
      nameOnCard: {
        type: Sequelize.STRING,
      },
      originalPrice: {
        type: Sequelize.INTEGER,
      },
      discountedPrice: {
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
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OrderBreakDowns");
  },
};
