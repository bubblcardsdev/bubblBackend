import model from "../models/index.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import loggers from "../config/logger.js";

async function userProfile(req, res) {
  try {
    const user = req.user;
    const userProfile = await model.User.findOne({
      where: { id: user.id },
      include: [
        {
          model: model.ClaimLink,
        },
        {
          model: model.BubblPlanManagement,
        },
      ],

      attributes: [
        "userImage",
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "DOB",
        "gender",
        "country",
        "local",
        "google",
        "facebook",
        "linkedin",
      ],
    });
    const userImgPath = userProfile.dataValues.userImage;
    if (userImgPath !== "") {
      const SignedImage = await generateSignedUrl(userImgPath);
      userProfile.dataValues.userImage = SignedImage;
    }

    if (userProfile) {
      return res.json({ userProfile });
    } else {
      return res.json();
    }
  } catch (error) {
    loggers.error(error+"from userProfile function");
    return res.json({
      success: false,
      data: {
        error: error.message,
      },
    });
  }
}

export default { userProfile };
