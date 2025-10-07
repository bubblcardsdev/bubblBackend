"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userImage: {
        type: Sequelize.STRING,
        allowNull: true,
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
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
        unique: true,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "",
      },
      DOB: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "",
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "",
      },
      countryCode: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      forgotPasswordId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      emailVerificationId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      otpExpiresIn: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      phoneVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      local: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      google: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      facebook: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      linkedin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      signupType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "local",
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
    },
  );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
