"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  class SupportForm extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  SupportForm.init(
    {
      firstName: {
        type: Sequelize.STRING, 
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      emailId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SupportForm",
      timestamps: true,       // still enables createdAt
      updatedAt: false,
    }
  );

  return SupportForm;
};
