"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class AccountDeviceLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AccountDeviceLink.init(
    {
      deviceId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "Devices",
          key: "id",
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "AccountDeviceLink",
    }
  );
  return AccountDeviceLink;
};
