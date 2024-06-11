"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ShippingCharge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ShippingCharge.init(
    {
      country: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ShippingCharge",
    }
  );
  return ShippingCharge;
};
