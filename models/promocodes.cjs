"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  class PromoCode extends Model {
    static associate(models) {
      // N..1 PromoCodeType
    
    }
  }

  PromoCode.init(
    {
      code: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      offerTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "PromoCodeTypes", key: "id" },
      },
      // PERCENT => 0..100, FLAT => amount, FREE_QUANTITY => number of units
      offerValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      minValue: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      minQuantity: { type: Sequelize.INTEGER, allowNull: true },
      freeQuantity: { type: Sequelize.INTEGER, allowNull: true },
      maxAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      maxUses: { type: Sequelize.INTEGER, allowNull: true },
      newUser: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      expireAt: { type: Sequelize.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "PromoCode",
      // tableName defaults to "PromoCodes"
      timestamps: true,
      hooks: {
        beforeValidate: (promo) => {
          if (promo.code) promo.code = String(promo.code).trim().toUpperCase();
        },
      },
    }
  );

  return PromoCode;
};
