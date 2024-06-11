"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class LeadGen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LeadGen.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      emailId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "LeadGen",
    }
  );
  return LeadGen;
};
