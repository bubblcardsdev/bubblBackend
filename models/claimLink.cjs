"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ClaimLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ClaimLink.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      claimLinkName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ClaimLink",
    }
  );
  return ClaimLink;
};
