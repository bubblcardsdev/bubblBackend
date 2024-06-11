"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Analytics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Analytics.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "DeviceLinks",
          key: "id",
        },
      },
      actionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "ActionLookUps",
          key: "id",
        },
      },
      modeId: {
        type: Sequelize.INTEGER,
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      webHeader: {
        type: Sequelize.STRING(10000),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Analytics",
    }
  );
  return Analytics;
};
