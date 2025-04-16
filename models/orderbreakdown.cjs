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
      },
      customName: {
        type: Sequelize.STRING,
      },
      originalPrice: {
        type: Sequelize.INTEGER,
      },
      discountedPrice: {
        type: Sequelize.INTEGER,
      },
      discountPercentage: {
        type: Sequelize.INTEGER,
      },
      discountedAmount: {
        type: Sequelize.INTEGER,
      },
      sellingPrice: {
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
