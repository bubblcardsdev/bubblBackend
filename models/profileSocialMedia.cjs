"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ProfileSocialMedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileSocialMedia.init(
    {
      socialMediaIcon: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      socialMediaLabel: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "ProfileSocialMedia",
    }
  );
  return ProfileSocialMedia;
};
