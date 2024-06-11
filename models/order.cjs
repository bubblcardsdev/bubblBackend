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
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      orderStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deliveryBy: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      cancelledOrder: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
