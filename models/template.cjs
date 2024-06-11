"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Template extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Template.init(
    {
      templateName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
        unique: true,
      },
      templateNameId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      templateActiveStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Template",
    }
  );
  return Template;
};
