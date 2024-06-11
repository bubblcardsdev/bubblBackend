"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Analytics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "DeviceLinks",
          key: "id",
        },
      },
      actionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "ActionLookUps",
          key: "id",
        },
      },
      modeId: {
        type: Sequelize.INTEGER,
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      webHeader: {
        type: Sequelize.STRING(10000),
        allowNull: false,
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
  async down(queryInterface) {
    await queryInterface.dropTable("Analytics");
  },
};
