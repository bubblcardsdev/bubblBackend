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

      if(profileImageCheck){
        await model.ProfileImages.update({
          image: squareImage.key,
          // profileId: profileId,
          // type: 0,
        }, {where:{
          profileId: profileId,
          type: 0,
        }});
        await model.ProfileImages.update({
          image: rectangleImage.key,
          // profileId: profileId,
        },{where:{
          profileId: profileId,
          type: 1,
        }});
      }else{
        await model.ProfileImages.create({
          image: squareImage.key,
          profileId: profileId,
          type: 0,
        }, );
        await model.ProfileImages.create({
          image: rectangleImage.key,
         profileId: profileId,
          type: 1,
        },);
      }
      

      const profileImageUrl = await model.ProfileImages.findAll({
        where: { profileId },
      });

      return res.json({
        success: true,
        data: {
          message: "Profile Image uploaded successfully",
          profileImageUrl,
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
    loggers.error(error+"from profileImageUpload function");
    return res.json({
      success: false,
      data: {
        error,
      },
    });
  }
}

async function pdfImageUpload(res, keyFileName, userId) {
  try {
    let getOrder = await model.Order.findOne({
      where: {
        customerId: userId,
        orderStatus: "cart",
      },
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
    loggers.error(error+"from pdfImageUpload function");
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
    loggers.error(error+"from brandingLogoUpload function");
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
    loggers.error(error+"from qrCodeImageUpload function");
    return res.json({
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
    loggers.error(error+"from userImageUpload function");
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
};
