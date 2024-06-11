"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class CustomizedImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CustomizedImages.init(
    {
      customUrl: {
        type: Sequelize.STRING,
      },
      customerId: {
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
      },
      itemId: {
        type: Sequelize.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "CustomizedImages",
    }
  );
  return CustomizedImages;
};
