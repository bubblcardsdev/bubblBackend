"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DeviceBrandings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      deviceLinkId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "DeviceLinks",
          key: "id",
        },
      },
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Profiles",
          key: "id",
        },
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Templates",
          key: "id",
        },
      },
      darkMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      brandingFontColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingBackGroundColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingAccentColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
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
    await queryInterface.dropTable("DeviceBrandings");
  },
};
