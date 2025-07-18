"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
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
        // unique: true,
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
       apple: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      signupType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "local",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
