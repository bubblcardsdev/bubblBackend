"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ProfileEmail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileEmail.init(
    {
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Profiles",
          key: "id",
        },
      },
      emailId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      emailType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      checkBoxStatus: {
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
      modelName: "ProfileEmail",
    }
  );
  return ProfileEmail;
};
