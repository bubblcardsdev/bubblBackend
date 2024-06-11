"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ModeDirectUrl extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ModeDirectUrl.init(
    {
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Devices",
          key: "id",
        },
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
    },
    {
      sequelize,
      modelName: "ModeDirectUrl",
    }
  );
  return ModeDirectUrl;
};
