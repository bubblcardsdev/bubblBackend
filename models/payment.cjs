"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init(
    {
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "",
      },
      bankRefNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Orders",
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
      shippingCharge: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      paymentStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      failureMessage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount:{
        type: Sequelize.INTEGER
      },
      isLoggedIn:{
        type: Sequelize.BOOLEAN
      }
    },
    {
      sequelize,
      modelName: "Payment",
    }
  );
  return Payment;
};
