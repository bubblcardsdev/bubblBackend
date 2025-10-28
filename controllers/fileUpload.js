import loggers from "../config/logger.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import model from "../models/index.js";
import {
  brandingLogoUploadSchema,
  profileImageUploadSchema,
  qrCodeImageUploadSchema,
} from "../validations/fileUpload.js";

async function profileImageUpload(req, res) {
  try {
    const { profileId } = req.body;
    // Square img and Rectangle image
    const {
      squareImage: [squareImage],
      rectangleImage: [rectangleImage],
    } = req.files;

    const { error } = profileImageUploadSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.json({
        success: false,
        data: {
          error: error.details,
        },
      });
    }

    const profile = await model.Profile.findOne({
      where: { id: profileId },
    });

    // Need to change
    if (profile) {
      const profileImageCheck = await model.ProfileImages.findOne({
        where: { profileId },
      });

      if (profileImageCheck) {
        await model.ProfileImages.update(
          {
            image: squareImage.key,
            // profileId: profileId,
            // type: 0,
          },
          {
            where: {
              profileId: profileId,
              type: 0,
            },
          }
        );
        await model.ProfileImages.update(
          {
            image: rectangleImage.key,
            // profileId: profileId,
          },
          {
            where: {
              profileId: profileId,
              type: 1,
            },
          }
        );
      } else {
        await model.ProfileImages.create({
          image: squareImage.key,
          profileId: profileId,
          type: 0,
        });
        await model.ProfileImages.create({
          image: rectangleImage.key,
          profileId: profileId,
          type: 1,
        });
      }

      const profileImageUrl = await model.ProfileImages.findAll({
  where: { profileId },
});

const plainProfileImages = profileImageUrl.map((img) => img.get({ plain: true }));

      return res.json({
        success: true,
        data: {
          message: "Profile Image uploaded successfully",
         profileImageUrl:plainProfileImages,
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Profile not found",
        },
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from profileImageUpload function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function profileImageUploadLatest(req, res) {
  const { profileId } = req.body;
  console.log(req.files, "/",profileId);

  const {
    profileImage: [profileImage],
    companyLogo: [companyLogo],
  } = req.files;

  const { error } = profileImageUploadSchema.validate(profileId, {
    abortEarly: false,
  });
  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }
  try {
    const profile = await model.Profile.findOne({
      where: { id: profileId },
    });

if (profile) { // need to upload company logo in company image
  const [rowsAffected] = await model.ProfileImages.upsert(
    { image: profileImage[0].key },
    { where: { id: profileId } }
  );
  const [affected] =  await model.Profile.update(
        { brandingLogo: companyLogo[0].key },
        { where: { id: profileId } }
      );

  if (rowsAffected > 0 || affected > 0) {

    const signedUrl =  await generateSignedUrl(profileImage[0].key)
     const brandingLogoUrl = await generateSignedUrl(key);
    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      data: {profilr_image:signedUrl,compamy_logo:brandingLogoUrl}
    });
  } else {
    return res.status(404).json({
      success: false,
      message: "No matching record found or image is unchanged.",
    });
  }
} else {
  return res.status(404).json({
    success: false,
    message: "Profile not found.",
  });
}

  } catch (err) {
    console.log(error);
    loggers.error(error + "from profileImageUpload function");
    return res.status(500).json({
      success: false,
      data: {
        error,
      },
    });
  }

}

async function pdfImageUpload(res, keyFileName, userId, email = "") {
  try {
    const whereClause = email
      ? {
          email,
          orderStatus: "cart",
        }
      : {
          customerId: userId,
          orderStatus: "cart",
        };
    let getOrder = await model.Order.findOne({
      where: whereClause,
    });

    await model.CustomizedImages.update(
      {
        pdfImage: keyFileName,
      },
      {
        where: {
          orderId: getOrder.id,
        },
      }
    );
  } catch (error) {
    console.log(error, "Error Occuring");
    loggers.error(error + "from pdfImageUpload function");
  }
}

async function brandingLogoUpload(req, res) {
  try {
    const { profileId } = req.body;
    const { key } = req.file;

    const { error } = brandingLogoUploadSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.json({
        success: false,
        data: {
          error: error.details,
        },
      });
    }

    const profile = await model.Profile.findOne({
      where: { id: profileId },
    });

    if (profile) {
      await model.Profile.update(
        { brandingLogo: key },
        { where: { id: profileId } }
      );

      const brandingLogoUrl = await generateSignedUrl(key);
      return res.json({
        success: true,
        data: {
          message: "Branding Logo uploaded successfully",
          brandingLogoUrl,
          key
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Profile not found",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from brandingLogoUpload function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function qrCodeImageUpload(req, res) {
  try {
    const { profileId } = req.body;
    const { key } = req.file;

    const { error } = qrCodeImageUploadSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.json({
        success: false,
        data: {
          error: error.details,
        },
      });
    }

    const profile = await model.Profile.findOne({
      where: { id: profileId },
    });

    if (profile) {
      await model.Profile.update(
        { qrCodeImage: key },
        { where: { id: profileId } }
      );

      const qrCodeImageUrl = await generateSignedUrl(key);
      return res.json({
        success: true,
        data: {
          message: "QR Code Image uploaded successfully",
          qrCodeImageUrl,
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "Profile not found",
        },
      });
    }
  } catch (error) {
    loggers.error(error + "from qrCodeImageUpload function");
    return res.status(500).json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function userImageUpload(req, res) {
  try {
    const userId = req.user.id;
    const { key } = req.file;
    const user = await model.User.findOne({
      where: { id: userId },
    });

    if (user) {
      await model.User.update({ userImage: key }, { where: { id: userId } });

      const userImageUrl = await generateSignedUrl(key);
      return res.json({
        success: true,
        data: {
          message: "Image uploaded successfully",
          userImageUrl,
        },
      });
    } else {
      return res.json({
        success: false,
        data: {
          message: "User Profile not found",
        },
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from userImageUpload function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}
export {
  profileImageUpload,
  brandingLogoUpload,
  qrCodeImageUpload,
  userImageUpload,
  pdfImageUpload,
  profileImageUploadLatest,
};
