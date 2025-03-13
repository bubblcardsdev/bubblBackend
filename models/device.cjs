"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Device.init(
    {
      deviceUid: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
        unique: true,
      },
      deviceType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      deviceNickName: {
        type:Sequelize.STRING,
      }
    },
    {
      sequelize,
      modelName: "Device",
    }
  );
  return Device;
};
