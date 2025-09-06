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


async function userImageDelete(req, res) {
  try {
    const userId = req.user.id;

    const user = await model.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.json({
        success: false,
        data: { message: "User not found" },
      });
    }

    await model.User.update(
      { userImage: "" },
      { where: { id: userId } }
    );

    return res.json({
      success: true,
      data: {
        message: "Image deleted successfully",
        userImageUrl: "",
      },
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + " from userImageDelete function");
    return res.json({
      success: false,
      data: { error },
    });
  }
}


export default { userProfile,userImageDelete };
