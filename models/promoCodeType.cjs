"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  class PromoCodeType extends Model {
    static associate(models) {
      // PromoCodeType 1..N PromoCode

    }
  }

  PromoCodeType.init(
    {
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "PromoCodeType",
      // tableName defaults to "PromoCodeTypes"
      timestamps: true,
    }
  );

  return PromoCodeType;
};
