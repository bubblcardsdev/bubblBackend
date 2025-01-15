"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class NameCustomCards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NameCustomCards.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
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
      customName: {
        type: Sequelize.STRING,
      },
      fontStyle: {
        type: Sequelize.STRING,
      },
      isMailSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pdfImage: {
        type: Sequelize.STRING,
      },
      deviceInventorId: {
        type: Sequelize.INTEGER,
        references: {
          model: "NameCustomImages",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "NameCustomCards",
    }
  );
  return NameCustomCards;
};
