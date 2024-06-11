"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Profile.init(
    {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      profileName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
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
      designation: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      companyAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      shortDescription: {
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
      zipCode: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingLogo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      brandingFont: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      phoneNumberEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      emailEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      websiteEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      socialMediaEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      digitalMediaEnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      qrCodeImage: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Templates",
          key: "id",
        },
      },
      modeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Modes",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Profile",
      hooks: {
        afterFind: async (profile, options) => {
          const fileUpload = await import("../middleware/fileUpload.js");
          let profileImage = profile?.getDataValue("profileImage") || "";
          let profileImageUrl = "";
          let brandingLogo = profile?.getDataValue("brandingLogo") || "";
          let brandingLogoUrl = "";
          let qrCodeImage = profile?.getDataValue("qrCodeImage") || "";
          let qrCodeImageUrl = "";

          if (profileImage !== "") {
            profileImageUrl = await fileUpload.generateSignedUrl(profileImage);
            profile.setDataValue("profileImageUrl", profileImageUrl);
          }

          if (brandingLogo !== "") {
            brandingLogoUrl = await fileUpload.generateSignedUrl(brandingLogo);
            profile.setDataValue("brandingLogoUrl", brandingLogoUrl);
          }

          if (qrCodeImage !== "") {
            qrCodeImageUrl = await fileUpload.generateSignedUrl(qrCodeImage);
            profile.setDataValue("qrCodeImageUrl", qrCodeImageUrl);
          }
        },
      },
    }
  );
  return Profile;
};
