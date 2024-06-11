"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ProfileDigitalPaymentLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileDigitalPaymentLink.init(
    {
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Profiles",
          key: "id",
        },
      },
      profileDigitalPaymentsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ProfileDigitalPayments",
          key: "id",
        },
      },
      digitalPaymentLink: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      enableStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      activeStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ProfileDigitalPaymentLink",
    }
  );
  return ProfileDigitalPaymentLink;
};
