"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class DeviceInventories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceInventories.init(
    {
      name: {
        type: Sequelize.STRING,
      },
      deviceTypeId: {
        type: Sequelize.INTEGER,
        reference: {
          model: "DeviceTypeMasters",
          key: "id",
        },
      },
      productId: {
        type: Sequelize.UUID,
        unique: true,
      },
      shortDescription: {
        type: Sequelize.TEXT,
      },
      deviceDescription: {
        type: Sequelize.TEXT,
      },
      materialTypeId: {
        type: Sequelize.INTEGER,
        reference: {
          model: "MaterialTypeMasters",
          key: "id",
        },
      },
      patternId: {
        type: Sequelize.INTEGER,
        reference: {
          model: "DevicePatternMasters",
          key: "id",
        },
      },
      colorId: {
        type: Sequelize.INTEGER,
        reference: {
          model: "DeviceColorMasters",
          key: "id",
        },
      },
      fontId: {
        type: Sequelize.INTEGER,
        references: {
          model: "CustomFontMasters",
          key: "id",
        },
      },
      productDetails: {
        type: Sequelize.TEXT,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      discountPercentage: {
        type: Sequelize.INTEGER,
      },
      availability: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "DeviceInventories",
    }
  );
  return DeviceInventories;
};
