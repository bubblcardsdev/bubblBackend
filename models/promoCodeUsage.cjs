"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  class PromoCodeUsage extends Model {
    static associate(models) {
      // N..1 PromoCode

    }
  }

  PromoCodeUsage.init(
    {
      promoCodeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "PromoCodes", key: "id" },
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: { isEmail: true },
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      sequelize,
      modelName: "PromoCodeUsage",
      // tableName defaults to "PromoCodeUsages"
      timestamps: true,
    }
  );

  return PromoCodeUsage;
};
