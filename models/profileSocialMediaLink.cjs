"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ProfileSocialMediaLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProfileSocialMediaLink.init(
    {
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Profiles",
          key: "id",
        },
      },
      profileSocialMediaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ProfileSocialMedia",
          key: "id",
        },
      },
      socialMediaName: {
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
      modelName: "ProfileSocialMediaLink",
    }
  );
  return ProfileSocialMediaLink;
};
