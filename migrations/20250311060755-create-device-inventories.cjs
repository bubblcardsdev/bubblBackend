"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DeviceInventories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      deviceTypeId: {
        type: Sequelize.INTEGER,
        reference: {
          model: "DeviceTypeMasters",
          key: "id",
        },
      },
      productId: {
        type: Sequelize.UUID,
      },
      shortDescription: {
        type: Sequelize.TEXT,
      },
      deviceDescription: {
        type: Sequelize.TEXT,
      },
      materialTypeId: {
        type: Sequelize.INTEGER,
         reference: {
          model: "MaterialTypeMasters",
          key: "id",
        },
      },
      patternId: {
        type: Sequelize.INTEGER,
         reference: {
          model: "DevicePatternMasters",
          key: "id",
        },
      },
      colorId: {
        type: Sequelize.INTEGER,
         reference: {
          model: "DeviceColorMasters",
          key: "id",
        },
      },
      productDetails: {
        type: Sequelize.TEXT,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      discountPercentage: {
        type: Sequelize.INTEGER,
      },
      availability: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("DeviceInventories");
  },
};
