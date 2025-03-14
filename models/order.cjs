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
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      discountPercentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      discountAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      soldPrice: {
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
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      productUUId: {
        type: Sequelize.UUID,
      },
      orderStatusId: {
        type: Sequelize.INTEGER,
      },
      isLoggedIn: {
        type: Sequelize.BOOLEAN,
      },
      shippingCharge: {
        type: Sequelize.INTEGER,
      },
      fontId: {
        type: Sequelize.INTEGER,
      },
      nameOnCard: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
