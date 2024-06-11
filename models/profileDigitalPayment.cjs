"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ProfileDigitalPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileDigitalPayment.init(
    {
      digitalPaymentIcon: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      digitalPaymentLabel: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "ProfileDigitalPayment",
    }
  );
  return ProfileDigitalPayment;
};
