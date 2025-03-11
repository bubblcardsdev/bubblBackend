"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class DeviceImageInventories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceImageInventories.init(
    {
      imageKey: {
        type: Sequelize.STRING,
      },
      deviceId: {
        type: Sequelize.INTEGER,
        reference: {
          model: "DeviceInventories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "DeviceImageInventories",
    }
  );
  return DeviceImageInventories;
};
