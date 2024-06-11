"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class ProfileImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }
  }
  ProfileImages.init(
    {
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Profiles",
          key: "id",
        },
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProfileImages",
      hooks: {
        afterFind: async (profileImage) => {
          const fileUpload = await import("../middleware/fileUpload.js");

          if (profileImage) {
            const profileImages = Array.isArray(profileImage)
              ? profileImage
              : [profileImage];
            for (const item of profileImages) {
              const image = item.getDataValue("image") || "";

              if (image !== "") {
                const imageUrl = await fileUpload.generateSignedUrl(image);
                item.setDataValue("image", imageUrl);
              }
            }
          }
        },
      },
    }
  );
  return ProfileImages;
};
