"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class PlanPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PlanPayment.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      planId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Plans",
          key: "id",
        },
      },
      bankRefNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      paymentStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      failureMessage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PlanPayment",
    }
  );
  return PlanPayment;
};
