"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Plan.init(
    {
      planName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      monthlyPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      annualPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      shortDescription: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // discountPercentage: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   defaultValue: 0,
      // },
    },
    {
      sequelize,
      modelName: "Plan",
    }
  );
  return Plan;
};
