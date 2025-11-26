"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  class PlanOrder extends Model {
    static associate(models) {
      // Define associations here
    }
  }

PlanOrder.init(
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

      planType: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      soldPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      orderStatusId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "OrderStatusMaster",
          key: "id",
        },
      },

      razorpayOrderID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PlanOrder",
    }
  );

  return PlanOrder;
};
