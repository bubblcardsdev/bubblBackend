"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class UniqueUserNameDeviceLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UniqueUserNameDeviceLink.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      profileId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Profiles",
          key: "id",
        },
      },
      deviceLinkId: {
        type: Sequelize.INTEGER,
        references: {
          model: "DeviceLinks",
          key: "id",
        },
      },
      uniqueName: {
        unique: true,
        type: Sequelize.STRING,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "UniqueUserNameDeviceLink",
    }
  );
  return UniqueUserNameDeviceLink;
};
