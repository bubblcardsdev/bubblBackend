"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class BubblPlanManagement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BubblPlanManagement.init(
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

      subscriptionType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "lifetime",
      },
      planValidity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      planStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      planEndDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isValid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "BubblPlanManagement",
    }
  );
  return BubblPlanManagement;
};
