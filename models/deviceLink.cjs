"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class DeviceLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceLink.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      accountDeviceLinkId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "AccountDeviceLinks",
          key: "id",
        },
      },
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Profiles",
          key: "id",
        },
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Templates",
          key: "id",
        },
      },
      modeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Modes",
          key: "id",
        },
      },
      activeStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "DeviceLink",
    }
  );
  return DeviceLink;
};
