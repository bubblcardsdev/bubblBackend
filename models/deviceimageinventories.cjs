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
      deviceInventorId: {
        type: Sequelize.INTEGER,
        references: {
          model: "DeviceInventories",
          key: "id",
        },
      },
      deviceThumbnailImageUrl: {
        type: Sequelize.STRING,
      },
      fontColor: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "DeviceImageInventories",
    }
  );
  return DeviceImageInventories;
};
