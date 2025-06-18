"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order.init(
    {
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      // orderStatus: {
      //   type: Sequelize.STRING,
      // },
      // deliveryBy: {
      //   type: Sequelize.STRING,
      //   defaultValue: "",
      // },
      // cancelledOrder: {
      //   type: Sequelize.BOOLEAN,
      //   defaultValue: false,
      // },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      orderStatusId: {
        type: Sequelize.INTEGER,
      },
      isLoggedIn: {
        type: Sequelize.BOOLEAN,
      },
      shippingCharge: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      soldPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
