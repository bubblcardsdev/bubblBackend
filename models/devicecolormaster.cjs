"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class DeviceColorMaster extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceColorMaster.init(
    {
      name: {
        type: Sequelize.STRING,
      },
       colorCode: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "DeviceColorMaster",
    }
  );
  return DeviceColorMaster;
};
