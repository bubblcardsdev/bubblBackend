"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class DeviceBranding extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceBranding.init(
    {
      deviceLinkId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "DeviceLinks",
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
      darkMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      brandingFontColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingBackGroundColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingAccentColor: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
    },
    {
      sequelize,
      modelName: "DeviceBranding",
    }
  );
  return DeviceBranding;
};
