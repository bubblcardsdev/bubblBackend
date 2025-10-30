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
        if (!profileImage) return;

        const fileUpload = await import("../middleware/fileUpload.js");
        const generateSignedUrl = fileUpload.generateSignedUrl;

        const items = Array.isArray(profileImage)
          ? profileImage
          : [profileImage];

        for (const item of items) {
          const imageKey = item.getDataValue("image");
          if (!imageKey) continue;

          // Generate signed URL for the stored S3 key
          const signedUrl = await generateSignedUrl(imageKey);

          // Keep both: raw key + signed URL
          item.setDataValue("key", imageKey);
          item.setDataValue("image", signedUrl);
        }
      },
    },
  }
);
  return ProfileImages;
};
