"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class OrderBreakDown extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderBreakDown.init(
    {
      orderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Orders",
          key: "id",
        },
      },
      productId: {
        type: Sequelize.INTEGER,
        references: {
          model: "DeviceInventories",
          key: "id",
        },
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      fontId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "CustomFontMasters",
          key: "id",
        },
      },
      customName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      originalPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
      discountedPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
      discountPercentage: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      discountedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      sellingPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
    },
    {
      sequelize,
      modelName: "OrderBreakDown",
    }
  );
  return OrderBreakDown;
};
