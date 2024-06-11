"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Shipping extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Shipping.init(
    {
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Orders",
          key: "id",
        },
      },

      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      emailId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      flatNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      zipcode: {
        type: Sequelize.INTEGER,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      landmark: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      isShipped: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },

    {
      sequelize,
      modelName: "Shipping",
    }
  );
  return Shipping;
};
