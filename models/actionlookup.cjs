"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ActionLookUp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }
  }
  ActionLookUp.init(
    {
      actionName: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      modelName: "ActionLookUp",
    }
  );
  return ActionLookUp;
};
