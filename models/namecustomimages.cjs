"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class NameCustomImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NameCustomImages.init(
    {
      imageUrl: {
        type: Sequelize.STRING,
      },
      NameCustomDeviceId: {
        type: Sequelize.INTEGER,
      },
      cardView: {
        type: Sequelize.BOOLEAN,
      },
      printImgUrl: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "NameCustomImages",
    }
  );
  return NameCustomImages;
};
