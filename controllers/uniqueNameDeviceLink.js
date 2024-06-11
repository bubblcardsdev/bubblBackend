import { ValidationError } from "sequelize";
import model from "../models/index.js";

async function uniqueUserName(req, res) {
  try {
    const { uniqueName, deviceLinkId, profileId } = req.body;
    const userId = req.user.id;
    if (deviceLinkId) {
      const getDeviceLink = await model.DeviceLink.findOne({
        where: {
          id: deviceLinkId,
        },
      });

      if (!getDeviceLink) {
        return res.json({
          success: false,
          message: "Unable to find the Device Link State",
        });
      }

      const uniqueNameDetails = await model.UniqueNameDeviceLink.findOne({
        where: {
          deviceLinkId: deviceLinkId,
          uniqueName: uniqueName,
          userId: userId,
          profileId:profileId
        },
      });

      if (uniqueNameDetails) {
        const updateUniqueName = await model.UniqueNameDeviceLink.update(
          {
            uniqueName: uniqueName,
          },
          {
            where: {
              deviceLinkId: deviceLinkId,
              userId: userId,
              profileId:profileId
            },
          }
        );

        if (!updateUniqueName) {
          return res.json({
            success: false,
            message: "couldn't update",
          });
        }

        return res.json({
          success: true,
          message: "Successfully updated",
        });
      } else {
        const createUniqueName = await model.UniqueNameDeviceLink.create({
          uniqueName: uniqueName,
          deviceLinkId: deviceLinkId,
          profileId:profileId,
          userId: userId,
          isActive: true,
        });

        if (!createUniqueName) {
          return res.json({
            success: false,
            message: "Couldn't create",
          });
        }
        return res.json({
          success: true,
          message: "Successfully created",
          createUniqueName,
        });
      }
    } else {
      console.log(profileId, "profileId");
      const getDeviceLink = await model.Profile.findOne({
        where: {
          id: profileId,
          userId: userId,
        },
      });

      if (!getDeviceLink) {
        return res.json({
          success: false,
          message: "Unable to find the profile Link State",
        });
      }

      const uniqueNameDetails = await model.UniqueNameDeviceLink.findOne({
        where: {
          profileId: profileId,
          uniqueName: uniqueName,
          userId: userId,
        },
      });

      if (uniqueNameDetails) {
        const updateUniqueName = await model.UniqueNameDeviceLink.update(
          {
            uniqueName: uniqueName,
          },
          {
            where: {
              profileId: profileId,
              userId: userId,
            },
          }
        );

        if (!updateUniqueName) {
          return res.json({
            success: false,
            message: "couldn't update",
          });
        }

        return res.json({
          success: true,
          message: "Successfully updated",
        });
      } else {
        const createUniqueName = await model.UniqueNameDeviceLink.create({
          uniqueName: uniqueName,
          profileId: profileId,
          userId: userId,
          isActive: true,
        });

        if (!createUniqueName) {
          return res.json({
            success: false,
            message: "Couldn't create",
          });
        }
        return res.json({
          success: true,
          message: "Successfully created",
          createUniqueName,
        });
      }
    }
  } catch (error) {
    let message = error.message;
    if (error instanceof ValidationError && error.errors[0].type === "unique violation") {
      message = "Given name must be unique";
    }
    return res.json({
      success: false,
      message: message,
    });
  }
}

async function getUniqueName(req, res) {
  try {
    const { deviceLinkId } = req.body;

    const name = await model.UniqueNameDeviceLink.findOne({
      where: {
        deviceLinkId: deviceLinkId,
      },
      attributes: ["deviceLinkId", "uniqueName"],
    });

    if (!name) {
      return res.json({
        success: false,
        message: "cannot get the unique name",
      });
    }

    return res.json({
      success: true,
      message: "Unique Name fetched successfully",
      name,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export { uniqueUserName, getUniqueName };
