"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Mode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Mode.init(
    {
      mode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      activeStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Mode",
    }
  );
  return Mode;
};
