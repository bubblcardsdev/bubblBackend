import loggers from "../config/logger.js";
import model from "../models/index.js";

async function updateClaimLink(req, res) {
  const { emailId, claimLinkName } = req.body;
  try {
    const user = await model.User.findOne({
      where: {
        email: emailId,
      },
    });
    if (user) {
      const checkUser = await model.ClaimLink.findOne({
        where: {
          userId: user.id,
        },
      });
      if (checkUser) {
        const checkUniqueName = await model.ClaimLink.findOne({
          where: {
            claimLinkName,
          },
        });
        if (checkUniqueName) {
          return res.json({
            success: false,
            message: "Name already exists",
          });
        } else {
          await model.ClaimLink.update(
            {
              claimLinkName,
            },
            {
              where: {
                userId: user.id,
              },
            }
          );
          const findClaimLink = await model.ClaimLink.findOne({
            where: {
              userId: user.id,
            },
          });
          return res.json({
            success: true,
            message: "Name Updated",
            findClaimLink,
          });
        }
      }
    }
  } catch (error) {
    loggers.error(error+"from updateClaimLink function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getClaimLinkName(req, res) {
  const { claimLinkName } = req.body;
  try {
    const getLinkName = await model.ClaimLink.findOne({
      where: {
        claimLinkName,
      },
    });
    if (getLinkName) {
      return res.json({
        success: false,
        message: "Name already exists",
      });
    } else {
      return res.json({
        success: true,
        message: "true can update",
      });
    }
  } catch (error) {
    loggers.error(error+"from getClaimLinkName function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

export { updateClaimLink, getClaimLinkName };
