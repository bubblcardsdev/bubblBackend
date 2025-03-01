"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class DeviceInventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceInventory.init(
    {
      deviceType: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      deviceColor: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deviceImage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deviceDescription: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      shortDescription: {
        type: Sequelize.STRING,
      },
      productDetails: {
        type: Sequelize.STRING,
      },
      availability: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      discountPercentage: {
        type: Sequelize.INTEGER,
      },
      deviceName: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "DeviceInventory",
    }
  );
  return DeviceInventory;
};
