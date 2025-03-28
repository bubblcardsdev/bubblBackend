/* eslint-disable no-unused-vars */
import loggers from "../config/logger.js";
import model from "../models/index.js";

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
          return res.json({
            success: false,
            message: "device is already linked to another user",
          });
        }
      }
    } else {
      return res.json({
        success: false,
        message: "Device not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deviceLink function");
    return res.json({
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
      return res.json({
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

        await model.DeviceBranding.update(
          {
            deviceLinkId: accountInProfileDeviceLink.id,
          },
          {
            where: {
              profileId: profileId,
            },
          }
        );
      } else {
        const deviceLinkId = await model.DeviceLink.create({
          accountDeviceLinkId: checkUserId.id,
          // deviceStatus: true,
          activestatus: true,
          profileId: profileId,
          templateId: 1,
          modeId: 2,
          userId: userId,
        });
        await model.DeviceBranding.update(
          {
            deviceLinkId: deviceLinkId.id,
          },
          {
            where: {
              profileId: profileId,
            },
          }
        );
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
    return res.json({
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
        return res.json({
          success: false,
          message: "Device is not active",
        });
      }
    } else {
      return res.json({ success: false, message: "Profile mismatch" });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deactivateDevice function");
    return res.json({
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
        return res.json({
          success: false,
          message: "Device not found",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Device not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from deleteDevice function");
    return res.json({
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
                deviceNickName: deviceNickName || "",
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
                deviceNickName: deviceNickName || "",
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

export {
  deviceLink,
  deactivateDevice,
  updateLinkDevice,
  deleteDevice,
  activateDevice,
  replaceDevice,
  getDeviceLink,
};
