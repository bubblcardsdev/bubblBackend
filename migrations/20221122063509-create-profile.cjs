"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Profiles", {
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
      profileName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      companyAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      shortDescription: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      zipCode: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingLogo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingFont: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      phoneNumberEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      emailEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      websiteEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      socialMediaEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      digitalMediaEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      qrCodeImage: {
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
    await queryInterface.dropTable("Profiles");
  },
};
