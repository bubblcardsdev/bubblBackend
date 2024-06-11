"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CustomCardPatterns extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CustomCardPatterns.init(
    {
      deviceType: {
        type: Sequelize.STRING,
      },
      color: {
        type: Sequelize.STRING,
      },
      patternUrl: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "CustomCardPatterns",
    }
  );
  return CustomCardPatterns;
};
