"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class FullyCustomCards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FullyCustomCards.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull:true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Orders",
          key: "id",
        },
      },
      email:{
        type: Sequelize.STRING,
        allowNull:true
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      productPrice: {
        type: Sequelize.INTEGER,
      },
      productStatus: {
        type: Sequelize.BOOLEAN,
      },
      isMailSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "FullyCustomCards",
    }
  );
  return FullyCustomCards;
};
