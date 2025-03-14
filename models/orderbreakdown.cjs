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
        type: Sequelize.UUID,
        references: {
          model: "DeviceInventories",
          key: "productId",
        },
      },
      fontId: {
        type: Sequelize.INTEGER,
        references: {
          model: "CustomFontMasters",
          key: "id",
        },
      },
      nameOnCard: {
        type: Sequelize.STRING,
      },
      originalPrice: {
        type: Sequelize.INTEGER,
      },
      discountedPrice: {
        type: Sequelize.INTEGER,
      },
      discountedAmount: {
        type: Sequelize.INTEGER,
      },
      sellingPrice: {
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "OrderBreakDown",
    }
  );
  return OrderBreakDown;
};
