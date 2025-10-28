"use strict";
const { Model, DataTypes } = require("sequelize");

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
      profileUid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
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
      
        brandingAccentColor: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "#60449a",
        },
        brandingBackGroundColor: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: null,
        },
        brandingFontColor: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: null,
        },
        darkMode: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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

          const enhance = async (p) => {
            // Guard: only process Sequelize instances
            if (
              !p ||
              typeof p.getDataValue !== "function" ||
              typeof p.setDataValue !== "function"
            ) {
              return;
            }

            let profileImage = p.getDataValue("profileImage") || "";
            let profileImageUrl = "";
            let brandingLogo = p.getDataValue("brandingLogo") || "";
            let brandingLogoUrl = "";
            let qrCodeImage = p.getDataValue("qrCodeImage") || "";
            let qrCodeImageUrl = "";

            if (profileImage !== "") {
              profileImageUrl = await fileUpload.generateSignedUrl(
                profileImage
              );
              p.setDataValue("profileImageUrl", profileImageUrl);
            }

            if (brandingLogo !== "") {
              brandingLogoUrl = await fileUpload.generateSignedUrl(
                brandingLogo
              );
              p.setDataValue("brandingLogoUrl", brandingLogoUrl);
            }

            if (qrCodeImage !== "") {
              qrCodeImageUrl = await fileUpload.generateSignedUrl(qrCodeImage);
              p.setDataValue("qrCodeImageUrl", qrCodeImageUrl);
            }
          };

          if (Array.isArray(profile)) {
            await Promise.all(profile.map(enhance));
          } else {
            await enhance(profile);
          }
        },
      },
    }
  );
  return Profile;
};
