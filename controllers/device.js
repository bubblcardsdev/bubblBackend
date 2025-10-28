/* eslint-disable no-unused-vars */
import { Op } from "sequelize";
import loggers from "../config/logger.js";
import model, { sequelize } from "../models/index.js";
import {
  linkDeviceSchema,
  switchModeSchema,
  switchProfileSchema,
  unlinkDeviceSchema,
  updateDeviceNameSchema,
  updateUniqueNameSchema,
} from "../validations/devices.js";

async function deviceLink(req, res) {
  const { deviceUid } = req.body;
  const userId = req.user.id;

  try {
    //find device ID
    const device = await model.Device.findOne({
      where: {
        deviceUid: deviceUid,
      },
    });

    if (device) {
      const deviceId = device.id;
      //find if device ever bound to user
      const accountDeviceLink = await model.AccountDeviceLink.findOne({
        where: {
          deviceId,
        },
      });

      //device never linked before
      if (accountDeviceLink === null) {
        const createAccountLink = await model.AccountDeviceLink.create({
          deviceId,
          userId,
          isDeleted: false,
        });
        return res.json({
          success: true,
          message: "Device Created Successfully",
          createAccountLink,
        });
      } else {
        //device already linked once and not deleted
        const checkDeviceStatus = await model.AccountDeviceLink.findOne({
          where: {
            deviceId,
            isDeleted: false,
          },
        }); //get the device row with deviceID

        //if never linked before or deleted atleast once
        if (checkDeviceStatus == null) {
          //check if same user
          const checkDeviceStatusForUser =
            await model.AccountDeviceLink.findOne({
              where: {
                deviceId,
                userId,
              },
            });

          if (checkDeviceStatusForUser) {
            // update the existing entry for the current user
            await model.AccountDeviceLink.update(
              {
                isDeleted: false,
              },
              {
                where: {
                  userId: checkDeviceStatusForUser.userId,
                  deviceId: checkDeviceStatusForUser.deviceId,
                },
              }
            );

            const createAccountLink = await model.AccountDeviceLink.findOne({
              where: {
                userId,
              },
            });
            return res.json({
              success: true,
              message: "Device link updated successfully",
              createAccountLink,
            });
          } else {
            const createAccountLink = await model.AccountDeviceLink.create({
              deviceId,
              userId,
              isDeleted: false,
            });
            return res.json({
              success: true,
              message: "Device Created Successfully",
              createAccountLink,
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: "device is already linked to another user",
          });
        }
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deviceLink function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
}

async function updateLinkDevice(req, res) {
  const { deviceUid, profileId, isMobile, deviceNickName } = req.body;
  const userId = req.user.id;
  console.log(userId, "tamils");

  try {
    const device = await model.Device.findOne({
      where: {
        deviceUid: deviceUid,
      },
    });

    const profile = await model.Profile.findOne({
      where: {
        id: profileId,
      },
    });
    if (profile === null) {
      return res.status(400).json({
        success: false,
        message: "Profile not exists",
      });
    }

    if (device) {
      let checkDeviceLink = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: device.id,
        },
      });
      if (checkDeviceLink === null) {
        await model.AccountDeviceLink.create({
          deviceId: device.id,
          userId,
          statusDevice: true,
        });
      }
      const checkUserId = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: device.id,
          userId: userId,
        },
      });

      const accountInProfileDeviceLink = await model.DeviceLink.findOne({
        where: {
          accountDeviceLinkId: checkUserId.id,
        },
      });

      if (accountInProfileDeviceLink) {
        await model.DeviceLink.update(
          {
            profileId: profileId,
            activeStatus: true,
          },
          {
            where: {
              accountDeviceLinkId: checkUserId.id,
            },
          }
        );

      } else {
         await model.DeviceLink.create({
          accountDeviceLinkId: checkUserId.id,
          // deviceStatus: true,
          activestatus: true,
          profileId: profileId,
          templateId: 1,
          modeId: 2,
          userId: userId,
        });

      }
      if (isMobile) {
        await model.Device.update(
          { deviceNickName: deviceNickName },
          {
            where: {
              deviceUid: deviceUid,
            },
          }
        );
      }
      return res.json({
        success: true,
        message: "Linked successfully",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from updateLinkDevice function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
}

async function deactivateDevice(req, res) {
  try {
    const { accountDeviceLinkId } = req.body;
    const profile = await model.DeviceLink.findOne({
      where: [
        {
          accountDeviceLinkId,
        },
      ],
    });
    if (profile) {
      const deviceStatus = profile.activeStatus;
      const value = false;
      if (deviceStatus === true) {
        await model.DeviceLink.update(
          {
            activeStatus: value,
          },
          {
            where: {
              accountDeviceLinkId,
            },
          }
        );

        return res.json({
          success: true,
          message: "Device Deactivated",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Device is not active",
        });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Profile mismatch" });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deactivateDevice function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
}

async function deleteDevice(req, res) {
  const userId = req.user.id;
  const { deviceId } = req.body;

  try {
    const device = await model.Device.findOne({
      where: {
        id: deviceId,
      },
    });
    if (device) {
      const checkAccountDeviceLink = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: device.id,
          userId,
        },
      });
      if (checkAccountDeviceLink) {
        const checkDeviceDeleteStatus = await model.AccountDeviceLink.findOne({
          where: {
            isDeleted: false,
          },
        });
        if (checkDeviceDeleteStatus) {
          const deleteDevice = await model.AccountDeviceLink.update(
            {
              isDeleted: true,
            },
            {
              where: {
                deviceId: device.id,
              },
            }
          );
          if (deleteDevice) {
            const deviceLink = await model.DeviceLink.findOne({
              where: {
                accountDeviceLinkId: checkAccountDeviceLink.id,
                userId,
              },
            });
            if (deviceLink !== null) {
              const updateDeviceLink = await model.DeviceLink.update(
                {
                  activeStatus: false,
                },
                {
                  where: {
                    accountDeviceLinkId: checkAccountDeviceLink.id,
                  },
                }
              );
              return res.json({
                success: true,
                message: "Device deleted successfully",
                updateDeviceLink,
              });
            } else {
              return res.json({
                success: true,
                message: "Device deleted successfully",
              });
            }
          } else {
            return res.json({
              success: true,
              message: "Device deleted successfully",
            });
          }
        } else {
          return res.json({
            success: false,
            message: "Device is already deleted",
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: "Device not found",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deleteDevice function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
}

async function activateDevice(req, res) {
  const { accountDeviceLinkId } = req.body;
  try {
    const profile = await model.DeviceLink.findOne({
      where: [
        {
          accountDeviceLinkId,
        },
      ],
    });
    if (profile) {
      const activeStatus = profile.activeStatus;

      if (activeStatus === false) {
        await model.DeviceLink.update(
          {
            activeStatus: true,
          },
          {
            where: {
              accountDeviceLinkId,
            },
          }
        );

        return res.json({
          success: true,
          message: "Device Activated",
        });
      } else {
        return res.json({
          success: false,
          message: "Device is already active",
        });
      }
    } else {
      return res.json({ success: false, message: "error" });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from activateDevice function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function replaceDevice(req, res) {
  const { deviceUid, deviceId, deviceNickName } = req.body;
  const userId = req.user.id;
  try {
    const device = await model.Device.findOne({
      where: {
        deviceUid,
      },
    });

    if (device) {
      const checkDeviceAccountLink = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: device.id,
        },
      });

      if (checkDeviceAccountLink === null) {
        const checkAccountDeviceLink = await model.AccountDeviceLink.findOne({
          where: {
            deviceId,
            userId,
          },
        });

        if (checkAccountDeviceLink) {
          const checkDeviceLink = await model.DeviceLink.findOne({
            where: {
              accountDeviceLinkId: checkAccountDeviceLink.id,
            },
          });

          if (checkDeviceLink) {
            const updateAccountDeviceLink =
              await model.AccountDeviceLink.update(
                {
                  deviceId: device.id,
                },
                {
                  where: {
                    deviceId,
                    userId,
                  },
                }
              );

            await model.Device.update(
              {
                deviceNickName: deviceNickName || null,
              },
              {
                where: {
                  id: device.id,
                },
              }
            );
            return res.json({
              success: true,
              message: "success",
              updateAccountDeviceLink,
            });
          } else {
            const updateDeviceLink = await model.AccountDeviceLink.update(
              {
                deviceId: device.id,
              },
              {
                where: {
                  deviceId,
                  userId,
                },
              }
            );
            await model.Device.update(
              {
                deviceNickName: deviceNickName || null,
              },
              {
                where: {
                  id: device.id,
                },
              }
            );
            return res.json({
              success: true,
              message: "success",
              updateDeviceLink,
            });
          }
        } else {
          return res.json({
            success: false,
            message: "Check Your Device Number, Device is not linked",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Check Your Device Number",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Device Not Found",
      });
    }
  } catch (error) {
    loggers.error(error + "from replaceDevice function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getDeviceLink(req, res) {
  try {
    const userId = req.user.id;

    const linkedDevices = await model.AccountDeviceLink.findAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: model.Device,
          required: false,
        },
        {
          model: model.DeviceLink,
          required: false,
        },
      ],
    });

    if (!linkedDevices || linkedDevices.length === 0) {
      return res.json({
        success: false,
        message: "No devices found",
      });
    }
    const unlinkedDevices = linkedDevices.filter((link) => {
      return !link.DeviceLink;
    });

    if (unlinkedDevices.length === 0) {
      return res.json({
        success: false,
        message: "No unlinked devices found",
      });
    }

    return res.json({
      success: true,
      message: "Unlinked Devices",
      unlinkedDevices: unlinkedDevices,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: `Error Occurred ${error.message}`,
    });
  }
}

async function getDeviceLinkLatest(req, res) {
  try {
    const userId = req.user.id;
    // const userId = req.query.userId;
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    const linkedDevices = await model.AccountDeviceLink.findAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: model.Device,
          required: false,
        },
        {
          model: model.DeviceLink,
          required: false,
        },
      ],
      offset: offset,
      limit: limit,
    });

    if (!linkedDevices || linkedDevices.length === 0) {
      return res.json({
        success: false,
        message: "No devices found",
      });
    }
    const unlinkedDevices = linkedDevices.filter((link) => {
      return !link.DeviceLink;
    });

    // if (unlinkedDevices.length === 0) {
    //   return res.json({
    //     success: false,
    //     message: "No unlinked devices found",
    //   });
    // }

    return res.json({
      success: true,
      message: "Unlinked Devices",
      unlinkedDevices: linkedDevices,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: `Error Occurred ${error.message}`,
    });
  }
}

async function fetchCardDetails(req, res) {
  const { deviceUId } = req.body;
  try {
    const device = await model.Device.findOne({
      where: { deviceUId: deviceUId },
    });

    if (!device) {
      return res.status(500).json({
        success: false,
        data: {
          message: "Invalid device Id",
        },
      });
    }

    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        deviceId: device.id,
        isDeleted: false,
      },
    });

    if (accountDeviceLink) {
      return res.status(500).json({
        success: false,
        data: {
          message: "Device is already in use",
        },
      });
    }

    return res.json({
      success: true,
      data: {
        deviceType: device.deviceType,
      },
    });
  } catch (error) {
    loggers.error(error + " from fetchCardDetails function");
    return res.status(500).json({
      success: false,
      data: {
        error,
      },
    });
  }
}

const getAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    // const checkUser = await model.User.findOne({
    //   where: {
    //     id: userId,
    //   },
    // });
    // if (!checkUser) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //   });
    // }

    const linkedDevices = await model.AccountDeviceLink.findAll({
      where: {
        userId: userId,
        isDeleted: false,
      },
      attributes: [
        ["id", "accountDeviceLinkId"],
        "deviceId",
        [sequelize.col("Device.deviceUid"), "deviceUid"],
        ["createdAt", "linkedAt"],
        [sequelize.col("Device.deviceNickName"), "deviceNickName"],
        [sequelize.col("Device.deviceType"), "deviceType"],
        // [sequelize.col("Device.DeviceInventories.DeviceTypeMasers.name"), "deviceType"],
        // [sequelize.col("Device.DeviceInventories.DeviceImageInventories.imageKey"), "deviceImage"],
        [sequelize.col("DeviceLink.id"), "deviceLinkId"],
        // [sequelize.col("Device.isActive"), "deviceActiveStatus"],
        [sequelize.col("DeviceLink.profileId"), "linkedProfileId"],
        [sequelize.col("DeviceLink.modeId"), "linkedModeId"],
        // ["isDeleted", "deviceStatus"],
        [sequelize.col("DeviceLink.activeStatus"), "deviceStatus"],
        [
          sequelize.col("DeviceLink.UniqueUserNameDeviceLink.uniqueName"),
          "uniqueName",
        ],
        [sequelize.col("DeviceLink.Profile.id"), "profileId"],
        [sequelize.col("DeviceLink.modeId"), "modeId"],
        [sequelize.col("DeviceLink.Profile.profileName"), "profileName"],
        [sequelize.col("DeviceLink.Mode.mode"), "mode"],
        [sequelize.col("Device.ModeDirectUrls.url"), "modeUrl"],
      ],
      include: [
        {
          model: model.Device,
          required: false,
          attributes: [],
          include: [
            {
              model: model.ModeDirectUrl,
              required: false,
              attributes: [],
            },
          ],
          // include: [
          //   {
          //     model: model.DeviceInventories,
          //     required: false,
          //     attributes: [],
          //     include: [
          //       {
          //         model: model.DeviceTypeMasters,
          //         required: false,
          //         attributes: [],
          //       },
          //       {
          //         model: model.DeviceImageInventories,
          //         required: false,
          //         attributes: [],
          //         limit: 1,
          //         order: [["id", "ASC"]],
          //       },
          //     ],
          //   },
          // ],
        },
        {
          model: model.DeviceLink,
          required: false,
          attributes: [],
          include: [
            {
              model: model.UniqueNameDeviceLink,
              required: false,
              attributes: [],
            },
            {
              model: model.Profile,
              required: false,
              attributes: [],
            },
            {
              model: model.Mode,
              required: false,
              attributes: [],
            },
          ],
        },
      ],
    });

    const profiles = await model.Profile.findAll({
      where: { userId: userId },
      attributes: ["id", "profileName"],
    });
    return res.json({
      success: true,
      message: "All Devices",
      data: { linkedDevices: linkedDevices, profiles: profiles || [] },
    });
  } catch (error) {
    loggers.error(error + " from getAllDevices function");
    throw error;
  }
};

const linkDevice = async (req, res) => {
  // Start a transaction for the whole operation
  const t = await sequelize.transaction();
  try {
    const { error } = linkDeviceSchema.validate(req.body);
    if (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { deviceUid, profileId, uniqueName, deviceNickName } = req.body;
    const userId = req.user.id;

    const checkUser = await model.User.findOne({
      where: {
        id: userId,
      },
      transaction: t,
    });

    if (!checkUser) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log("CheckUser", checkUser);

    //find device ID
    const device = await model.Device.findOne({
      where: {
        deviceUid: deviceUid,
      },
      transaction: t,
    });
    if (!device) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    console.log("Device", device);
    let profile;
    if (profileId) {
      profile = await model.Profile.findOne({
        where: {
          id: profileId,
        },
        transaction: t,
      });
      if (!profile) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }
    }
    console.log(profileId, profile, "Profile");
    const deviceId = device.id;

    if (uniqueName) {
      if (!profileId) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "ProfileId is required when uniqueName is provided",
        });
      }
      if (uniqueName.trim() === "") {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Unique name cannot be empty",
        });
      }
      //check user plan
      const userPlan = await model.BubblPlanManagement.findOne({
        where: {
          userId: userId,
        },
        transaction: t,
      });
      console.log(userPlan, "UserPlan");
      if (!userPlan || userPlan.planId === 1) {
        await t.rollback();
        return res.status(403).json({
          success: false,
          message: "Please subscribe to a plan to use this feature",
        });
      }
      const existingDeviceWithSameName =
        await model.UniqueNameDeviceLink.findOne({
          where: {
            uniqueName: uniqueName,
          },
          transaction: t,
        });
      console.log(existingDeviceWithSameName, "existingDeviceWithSameName");
      if (existingDeviceWithSameName) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Device with the same name already exists",
        });
      }
    }
    //find if device ever bound to user
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        deviceId: deviceId,
        isDeleted: false,
      },
      transaction: t,
    });

    if (accountDeviceLink) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Device is already linked",
      });
    }

    //check device nickname already exists for the user
    if (deviceNickName) {
      if (deviceNickName.trim() === "") {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Device nickname cannot be empty",
        });
      }

      const accountLinkedToUser = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: {
            [Op.ne]: deviceId,
          },
          userId,
          isDeleted: false,
        },
        attributes: [
          [sequelize.col("Device.deviceNickName"), "deviceNickName"],
          "id",
        ],
        include: [
          {
            model: model.Device,
            required: true,
            where: {
              deviceNickName: deviceNickName.trim(), // ✅ correct location
            },
            attributes: [],
          },
        ],
        transaction: t,
      });
      console.log(accountLinkedToUser, "accountLinkedToUser");
      if (
        accountLinkedToUser &&
        accountLinkedToUser.get("deviceNickName") === deviceNickName.trim()
      ) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Device with the same name already exists",
        });
      }
    }
    //link device to user
    const newAccountDeviceLink = await model.AccountDeviceLink.create(
      {
        deviceId,
        userId,
        isDeleted: false,
      },
      { transaction: t }
    );

    //update device nickname
    if (deviceNickName) {
      await model.Device.update(
        { deviceNickName: deviceNickName.trim() },
        {
          where: {
            id: device.id,
          },
          transaction: t,
        }
      );
    }

    //link device to profile
    if (profile) {
      const addDeviceLink = await model.DeviceLink.create(
        {
          accountDeviceLinkId: newAccountDeviceLink.id,
          activeStatus: true,
          profileId: profileId,
          templateId: profile.templateId || 1,
          modeId: profile.modeId || 2,
          userId: userId,
        },
        { transaction: t }
      );


      if (uniqueName) {
        const deviceUserName = await model.UniqueNameDeviceLink.findOne({
          where: {
            userId: userId,
            deviceLinkId: addDeviceLink.id,
          },
          transaction: t,
        });
        if (!deviceUserName) {
          await model.UniqueNameDeviceLink.create(
            {
              userId: userId,
              deviceLinkId: addDeviceLink.id,
              uniqueName: uniqueName,
              profileId: profileId || null,
            },
            { transaction: t }
          );
        } else {
          await model.UniqueNameDeviceLink.update(
            { uniqueName: uniqueName },
            {
              where: {
                id: deviceUserName.id,
              },
              transaction: t,
            }
          );
        }
      }
      await t.commit();
      return res.json({
        success: true,
        message: "Device Linked Successfully",
        data: {
          accountDeviceLink: newAccountDeviceLink.id,
          deviceLinkId: addDeviceLink.id,
          uniqueName: uniqueName || null,
          profileId: profileId || null,
        },
      });
    }

    await t.commit();
    return res.json({
      success: true,
      message: "Device Linked Successfully",
      accountDeviceLink: newAccountDeviceLink.id,
    });
  } catch (error) {
    await t.rollback();
    loggers.error(error + " from linkDevice function");
    console.log(error, " from linkDevice function");
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const unlinkDevice = async (req, res) => {
  // Start a transaction for the whole operation
  const t = await sequelize.transaction();
  try {
    const { error } = unlinkDeviceSchema.validate(req.body);
    if (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { deviceUid, accountDeviceLinkId } = req.body;
    const userId = req.user.id;

    console.log(deviceUid, userId, "unlinkDevice");
    // const checkUser = await model.User.findOne({
    //   where: {
    //     id: userId,
    //   },
    //   transaction: t,
    // });

    // if (!checkUser) {
    //   await t.rollback();
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //   });
    // }

    //find device ID
    const device = await model.Device.findOne({
      where: {
        deviceUid: deviceUid,
      },
      transaction: t,
    });

    if (!device) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    const deviceId = device.id;

    console.log(deviceId, "deviceId");
    //find if device ever bound to user
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        deviceId,
        id: accountDeviceLinkId,
        userId,
        isDeleted: false,
      },
      transaction: t,
    });

    if (!accountDeviceLink) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Device is not linked to this user",
      });
    }

    //find deviceLink
    const deviceLink = await model.DeviceLink.findOne({
      where: {
        accountDeviceLinkId: accountDeviceLink.id,
      },
      transaction: t,
    });



    //deactivate deviceLink
    if (deviceLink) {
      // await model.DeviceLink.update(
      //   {
      //     activeStatus: false,
      //   },
      //   {
      //     where: {
      //       accountDeviceLinkId: accountDeviceLink.id,
      //     },
      //   }
      // );

      //remove unique name entry
      await model.UniqueNameDeviceLink.destroy({
        where: {
          deviceLinkId: deviceLink.id,
          userId: userId,
        },
        transaction: t,
      });

      await model.DeviceLink.destroy({
        where: {
          accountDeviceLinkId: accountDeviceLink.id,
        },
        transaction: t,
      });
    }

    // //soft delete accountDeviceLink
    // await model.AccountDeviceLink.update(
    //   {
    //     isDeleted: true,
    //   },
    //   {
    //     where: {
    //       deviceId,
    //       userId,
    //       isDeleted: false,
    //     },
    //   }
    // );

    //hard delete accountDeviceLink
    await model.AccountDeviceLink.destroy({
      where: {
        id: accountDeviceLink.id,
      },
      transaction: t,
    });

    await t.commit();
    return res.json({
      success: true,
      message: "Device unlinked successfully",
    });
  } catch (error) {
    await t.rollback();
    loggers.error(error + " from unlinkDevice function");
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const switchProfile = async (req, res) => {
  const t = await sequelize.transaction(); // start transaction
  try {
    const { error } = switchProfileSchema.validate(req.body);
    if (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { accountDeviceLinkId, profileId } = req.body;
    const userId = req.user.id;
    console.log(userId, accountDeviceLinkId, profileId, "switchProfile");

    // const checkUser = await model.User.findOne({
    //   where: { id: userId },
    //   transaction: t,
    // });

    // if (!checkUser) {
    //   await t.rollback();
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //   });
    // }

    // find accountDeviceLink
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        id: accountDeviceLinkId,
        userId,
        isDeleted: false,
      },
      transaction: t,
    });

    if (!accountDeviceLink) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Device not found in your account",
      });
    }

    const profile = await model.Profile.findOne({
      where: {
        id: profileId,
        userId: userId,
      },
      transaction: t,
    });

    if (!profile) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // find deviceLink
    let deviceLink = await model.DeviceLink.findOne({
      where: {
        accountDeviceLinkId: accountDeviceLink.id,
        userId: userId,
      },
      transaction: t,
    });

    if (deviceLink && !deviceLink.activeStatus) {
      return res.status(400).json({
        success: false,
        message:
          "Device is deactivated, please activate the device to switch profile",
      });
    }

    if (!deviceLink) {
      deviceLink = await model.DeviceLink.create(
        {
          accountDeviceLinkId: accountDeviceLink.id,
          activeStatus: true,
          userId: userId,
          profileId: profileId,
          templateId: profile.templateId || 1,
          modeId: profile.modeId || 2,
        },
        { transaction: t }
      );
    } else {
      await model.DeviceLink.update(
        {
          profileId: profileId,
          activeStatus: true,
          templateId: profile.templateId || 1,
          modeId: profile.modeId || 2,
        },
        { where: { id: deviceLink.id }, transaction: t }
      );
    }

    await model.UniqueNameDeviceLink.update(
      { profileId: profileId },
      {
        where: {
          deviceLinkId: deviceLink.id,
          userId: userId,
        },
        transaction: t,
      }
    );

    await t.commit(); // ✅ commit all
    return res.json({
      success: true,
      message: "Profile switched successfully",
    });
  } catch (error) {
    await t.rollback(); // ❌ rollback on any error
    loggers.error(error + " from switchProfile function");
    console.log(error, " from switchProfile function");
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const switchModes = async (req, res) => {
  const t = await sequelize.transaction(); // start transaction
  try {
    const { error } = switchModeSchema.validate(req.body);
    if (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.id;

    const checkUser = await model.User.findOne({
      where: { id: userId },
      transaction: t,
    });
    const { deviceLinkId, accountDeviceLinkId, modeId, modeUrl } = req.body;
    console.log(userId, deviceLinkId, modeId, "switchModes");

    if (!checkUser) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // find accountDeviceLink
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        id: accountDeviceLinkId,
        userId,
        isDeleted: false,
      },
      transaction: t,
    });

    if (!accountDeviceLink) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Device not found in your account",
      });
    }

    const modeData = await model.Mode.findOne({
      where: {
        id: modeId,
      },
      transaction: t,
    });
    if (!modeData) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Mode not found",
      });
    }

    // find deviceLink
    let deviceLink = await model.DeviceLink.findOne({
      where: {
        id: deviceLinkId,
        accountDeviceLinkId: accountDeviceLink.id,
        userId: userId,
      },
      transaction: t,
    });

    if (!deviceLink) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Device link not found",
      });
    }

    if (!deviceLink.activeStatus) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Device is deactivated, please activate the device to switch mode",
      });
    }

    const checkModeUrl = await model.ModeDirectUrl.findOne({
      where: {
        deviceId: accountDeviceLink.deviceId,
      },
      transaction: t,
    });

    if (modeUrl) {
      if (checkModeUrl) {
        await model.ModeDirectUrl.update(
          { modeId: modeId, url: modeUrl },
          {
            where: { id: checkModeUrl.id },
            transaction: t,
          }
        );
      } else {
        await model.ModeDirectUrl.create(
          {
            deviceId: accountDeviceLink.deviceId,
            url: modeUrl,
          },
          { transaction: t }
        );
      }
    }

    await t.commit(); // ✅ commit all
    return res.json({
      success: true,
      message: "Mode switched successfully",
    });
  } catch (error) {
    await t.rollback();
    loggers.error(error + " from switchModes function");
    console.log(error, " from switchModes function");
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const blockDevice = async (req, res) => {
  try {
    const { accountDeviceLinkId } = req.body;
    const userId = req.user.id;
    if (!accountDeviceLinkId) {
      return res.status(400).json({
        success: false,
        message: "accountDeviceLinkId is required",
      });
    }
    // const checkUser = await model.User.findOne({
    //   where: { id: req.user.id },
    // });
    // if (!checkUser) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Unauthorized user",
    //   });
    // }
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: [
        {
          id: accountDeviceLinkId,
          userId,
          isDeleted: false,
        },
      ],
    });
    if (!accountDeviceLink) {
      return res.status(404).json({
        success: false,
        message: "Device not found in your account",
      });
    }

    await model.Device.update(
      {
        isActive: false,
      },
      {
        where: {
          id: accountDeviceLink.id,
        },
      }
    );
    await model.DeviceLink.update(
      {
        activeStatus: false,
      },
      {
        where: {
          accountDeviceLinkId: accountDeviceLink.id,
        },
      }
    );

    return res.json({
      success: true,
      message: "Device Blocked",
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from blockDevice function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const unblockDevice = async (req, res) => {
  try {
    const { accountDeviceLinkId } = req.body;
    if (!accountDeviceLinkId) {
      return res.status(400).json({
        success: false,
        message: "accountDeviceLinkId is required",
      });
    }
    const checkUser = await model.User.findOne({
      where: { id: req.user.id },
    });
    if (!checkUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: [
        {
          id: accountDeviceLinkId,
          userId: checkUser.id,
          isDeleted: false,
        },
      ],
    });
    if (!accountDeviceLink) {
      return res.status(404).json({
        success: false,
        message: "Device not found in your account",
      });
    }

    await model.Device.update(
      {
        isActive: true,
      },
      {
        where: {
          id: accountDeviceLink.deviceId,
        },
      }
    );

    await model.DeviceLink.update(
      {
        activeStatus: true,
      },
      {
        where: {
          accountDeviceLinkId: accountDeviceLink.id,
        },
      }
    );

    return res.json({
      success: true,
      message: "Device Unblocked",
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from unBlockdevice function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const deviceDeactivate = async (req, res) => {
  try {
    const { accountDeviceLinkId } = req.body;
    console.log(accountDeviceLinkId, "accountDeviceLinkId");
    if (!accountDeviceLinkId) {
      return res.status(400).json({
        success: false,
        message: "accountDeviceLinkId is required",
      });
    }
    const checkUser = await model.User.findOne({
      where: { id: req.user.id },
    });
    if (!checkUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: [
        {
          id: accountDeviceLinkId,
          userId: checkUser.id,
          isDeleted: false,
        },
      ],
    });
    if (!accountDeviceLink) {
      return res.status(404).json({
        success: false,
        message: "Device not found in your account",
      });
    }

    await model.DeviceLink.update(
      {
        activeStatus: false,
      },
      {
        where: {
          accountDeviceLinkId: accountDeviceLinkId,
        },
      }
    );

    return res.json({
      success: true,
      message: "Device Deactivated",
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deactivateDevice function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const deviceReactivate = async (req, res) => {
  try {
    const { accountDeviceLinkId } = req.body;
    if (!accountDeviceLinkId) {
      return res.status(400).json({
        success: false,
        message: "accountDeviceLinkId is required",
      });
    }
    const checkUser = await model.User.findOne({
      where: { id: req.user.id },
    });
    if (!checkUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: [
        {
          id: accountDeviceLinkId,
          userId: checkUser.id,
          isDeleted: false,
        },
      ],
    });
    if (!accountDeviceLink) {
      return res.status(404).json({
        success: false,
        message: "Device not found in your account",
      });
    }

    await model.DeviceLink.update(
      {
        activeStatus: true,
      },
      {
        where: {
          accountDeviceLinkId: accountDeviceLinkId,
        },
      }
    );

    return res.json({
      success: true,
      message: "Device Re-Activated",
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from reactivateDevice function");
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const updateUniqueName = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { error } = updateUniqueNameSchema.validate(req.body);

    if (error) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { deviceLinkId, uniqueName } = req.body;
    const userId = req.user.id;

    console.log(userId, deviceLinkId, uniqueName, "updateUniqueName");

    const checkUser = await model.User.findOne({
      where: { id: userId },

      attributes: ["id",[sequelize.col("BubblPlanManagements.planId"),"planId"]],
      include: {
        model: model.BubblPlanManagement,
        required: false,
        attributes: [],
      },
      transaction: t,
    });

    if (!checkUser) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (checkUser.planId !== 2) {
      res.status(402).json({
        success: false,
        message: "This feature is available only for Pro Members.",
        error: checkUser
      });
    }

    if (uniqueName.trim() === "") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Unique name cannot be empty",
      });
    }

    //check user plan
    const deviceLink = await model.DeviceLink.findOne({
      where: {
        id: deviceLinkId,
        userId: userId,
      },
      transaction: t,
    });

    if (!deviceLink) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Device link not found",
      });
    }
    const existingDeviceWithSameName = await model.UniqueNameDeviceLink.findOne(
      {
        where: {
          uniqueName: uniqueName,
          userId: userId,
          deviceLinkId: { [Op.ne]: deviceLinkId },
        },
        transaction: t,
      }
    );

    if (existingDeviceWithSameName) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Device with the same name already exists",
      });
    }

    await model.UniqueNameDeviceLink.upsert(
      {
        uniqueName: uniqueName,
      },
      { where: { deviceLinkId: deviceLinkId, userId: userId } },
      { transaction: t }
    );
    return res.json({
      success: true,
      message: "UniqueName updated Successfully",
    });
  } catch (error) {
    await t.rollback();
    loggers.error(error + " from updateUniqueName function");
    console.log(error, " from updateUniqueName function");
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateDeviceName = async (req, res) => {
  try {
    const { error } = updateDeviceNameSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.id;

    const checkUser = await model.User.findOne({
      where: { id: userId },

      attributes: ["id"],
    });

    if (!checkUser) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { accountDeviceLinkId, deviceNickName } = req.body;

    const accountDeviceLink = await model.AccountDeviceLink.findOne({
      where: {
        id: accountDeviceLinkId,
        userId: userId,
        isDeleted: false,
      },
      include: [
        {
          model: model.Device,
          required: false,
          attributes: [],
        },
      ],
      attributes: ["id", "deviceId"],
    });

    if (!accountDeviceLink) {
      res.status(400).json({
        success: false,
        message: "Device not found",
      });
    }

    const existing = await model.AccountDeviceLink.findOne({
      where: {
        deviceId: { [Op.ne]: accountDeviceLink.deviceId },
        userId: userId,
        isDeleted: false,
      },
      include: [
        {
          model: model.Device,
          required: true,
          attributes: [],
          where: {
            deviceNickName: deviceNickName,
          },
        },
      ],
      attributes: ["id"],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Device name already exists",
      });
    }

    await model.Device.update(
      {
        deviceNickName: deviceNickName,
      },
      {
        where: {
          id: accountDeviceLink.deviceId,
        },
      }
    );
    return res.json({
      success: true,
      message: "Device name updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "SOMETHING WENT WRONG",
    });
  }
};

export {
  deviceLink,
  deactivateDevice,
  updateLinkDevice,
  deleteDevice,
  activateDevice,
  replaceDevice,
  getDeviceLink,
  fetchCardDetails,
  getDeviceLinkLatest,
  getAllDevices,
  linkDevice,
  unlinkDevice,
  switchProfile,
  switchModes,
  blockDevice,
  unblockDevice,
  deviceDeactivate,
  deviceReactivate,
  updateUniqueName,
  updateDeviceName,
};
