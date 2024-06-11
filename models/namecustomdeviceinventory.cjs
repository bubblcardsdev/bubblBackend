"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class NameCustomDeviceInventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NameCustomDeviceInventory.init(
    {
      deviceType: {
        type: Sequelize.STRING,
      },
      displayName: {
        type: Sequelize.STRING,
      },
      deviceColor: {
        type: Sequelize.STRING,
      },
      fontColor: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "NameCustomDeviceInventory",
    }
  );
  return NameCustomDeviceInventory;
};
