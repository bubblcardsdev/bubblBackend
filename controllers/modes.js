import loggers from "../config/logger.js";
import model from "../models/index.js";

async function findAllModes(req, res) {
  try {
    const modes = await model.Mode.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    return res.json({
      success: true,
      message: "Modes Found",
      modes,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function selectMode(req, res) {
  const { mode, profileId } = req.body;
  try {
    const profile = await model.Profile.findOne({
      where: {
        id: profileId,
      },
    });
    if (profile) {
      const modes = await model.Mode.findOne({
        where: {
          mode: mode,
        },
      });
      if (modes) {
        switch (mode) {
          case "Contact Card":
            {
            const findContactMode = await model.Mode.findOne({
              where: {
                mode,
              },
            });
            await model.DeviceLink.update(
              {
                modeId: findContactMode.id,
              },
              {
                where: {
                  profileId: profileId,
                },
              }
            );
            break;
            }
          case "Bubbl Profile":
            {
            const findProfileMode = await model.Mode.findOne({
              where: {
                mode,
              },
            });
            await model.DeviceLink.update(
              {
                modeId: findProfileMode.id,
              },
              {
                where: {
                  profileId: profileId,
                },
              }
            );
            break;
            }
          case "Direct URL":
            {
            const findURLMode = await model.Mode.findOne({
              where: {
                mode,
              },
            });
            await model.DeviceLink.update(
              {
                modeId: findURLMode.id,
              },
              {
                where: {
                  profileId: profileId,
                },
              }
            );
            break;
            }
          case "Lead Form":
            {
            const findLeadMode = await model.Mode.findOne({
              where: {
                mode,
              },
            });
            await model.DeviceLink.update(
              {
                modeId: findLeadMode.id,
              },
              {
                where: {
                  profileId: profileId,
                },
              }
            );
            break;
            }
        }
        return res.json({
          success: true,
          message: "Profile Updated",
        });
      } else {
        return res.json({
          success: false,
          message: "Modes Not Found",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Profile Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error+"from selectMode function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function switchMode(req, res) {
  const { deviceId, modeId } = req.body;
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
        },
      });
      if (checkAccountDeviceLink) {
        const checkDeviceLink = await model.DeviceLink.findOne({
          where: {
            accountDeviceLinkId: checkAccountDeviceLink.id,
          },
        });
        if (checkDeviceLink) {
          const checkMode = await model.Mode.findOne({
            where: {
              id: modeId,
            },
          });
          if (checkMode) {
            const switchMode = await model.DeviceLink.update(
              {
                modeId: modeId,
              },
              {
                where: {
                  accountDeviceLinkId: checkAccountDeviceLink.id,
                },
              }
            );
            return res.json({
              success: true,
              message: "Mode changed successfully",
              switchMode,
            });
          } else {
            return res.json({
              success: false,
              message: "Check the mode id",
            });
          }
        } else {
          return res.json({
            success: false,
            message: "No device is attached",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Device is not attached",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "device not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error+"from switchMode function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function directUrl(req, res) {
  const { deviceId, url } = req.body;
  try {
    const device = await model.Device.findOne({
      where: {
        id: deviceId,
      },
    });
    if (device) {
      const checkDeviceLink = await model.AccountDeviceLink.findOne({
        where: {
          deviceId: device.id,
        },
      });
      if (checkDeviceLink) {
        const checkDeviceProfileId = await model.DeviceLink.findOne({
          where: {
            accountDeviceLinkId: checkDeviceLink.id,
          },
        });
        if (checkDeviceProfileId) {
          const checkUrl = await model.ModeDirectUrl.findOne({
            where: {
              deviceId,
            },
          });
          if (checkUrl) {
            const updateModeUrl = await model.ModeDirectUrl.update(
              {
                url,
              },
              {
                where: {
                  id: checkUrl.id,
                },
              }
            );
            return res.json({
              success: true,
              message: "Updated",
              updateModeUrl,
            });
          } else {
            const createDirectUrl = await model.ModeDirectUrl.create({
              deviceId: deviceId,
              url: url,
            });
            return res.json({
              success: true,
              message: "url Created",
              createDirectUrl,
            });
          }
        }
      }
    } else {
      return res.json({
        success: false,
        message: "Check device Number",
      });
    }
  } catch (error) {
    loggers.error(error+"from directUrl function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getDirectUrl(req, res) {
  const { deviceId } = req.body;
  try {
    const modeUrl = await model.ModeDirectUrl.findOne({
      where: {
        deviceId,
      },
    });
    return res.json({
      success: true,
      message: "URL",
      modeUrl,
    });
  } catch (error) {
    loggers.error(error+"from getDirectUrl function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

// async function leadGen(req, res) {
//   // const userId = req.user.id;
//   const { name, emailId, mobileNumber, deviceId } = req.body;
//   console.log(deviceId,"device id")
//   try {

    // const checkDevice = await model.Device.findOne({
    //   where:{
    //     deviceUid:deviceId
    //   }
    // });
    // console.log(checkDevice,"checkDevicecheckDevice");
    // const checkDeviceLink = await model.AccountDeviceLink.findOne({
    //   where:{
    //     deviceId:checkDevice.id
    //   }
    // });
    // console.log(checkDeviceLink,"checkDeviceLink");
    // const userId =  checkDeviceLink.userId;
    // console.log(userId,"user");


//       const checkDuplicateEntry = await model.LeadGen.findOne({
//         where: {
//           emailId: emailId,
//           mobileNumber: mobileNumber,
//         },
//       });
//       if (checkDuplicateEntry) {
//         return res.json({
//           success: false,
//           message: "duplicate entry",
//         });
//       } else {
//         const createLeadGen = await model.LeadGen.create({
//           name,
//           emailId,
//           mobileNumber,
//         });
//         return res.json({
//           success: true,
//           message: "Created Lead Generation",
//           createLeadGen,
//         });
//       }
//   } catch (error) {
//     console.log(error);
//     loggers.error(error+"from leadGen function");
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

async function leadGen(req, res) {
  // const userId = req.user.id;
  const { name, emailId, mobileNumber, deviceId } = req.body;
  try {
    const checkDevice = await model.Device.findOne({
      where:{
        deviceUid:deviceId
      }
    });
    const checkDeviceLink = await model.AccountDeviceLink.findOne({
      where:{
        deviceId:checkDevice.id
      }
    });
    const userId =  checkDeviceLink.userId;

    const checkLeadGen = await model.LeadGen.findAll({
      where: {
        userId,
      },
    });
    if (checkLeadGen) {
      const checkDuplicateEntry = await model.LeadGen.findOne({
        where: {
          emailId: emailId,
          mobileNumber: mobileNumber,
        },
      });
      if (checkDuplicateEntry) {
        return res.json({
          success: false,
          message: "duplicate entry",
        });
      } else {
        const createLeadGen = await model.LeadGen.create({
          userId,
          name,
          emailId,
          mobileNumber,
        });
        return res.json({
          success: true,
          message: "Created Lead Generation",
          createLeadGen,
        });
      }
    } else {
      const createLeadGene = await model.LeadGen.create({
        userId,
        name,
        emailId,
        mobileNumber,
      });
      return res.json({
        success: true,
        message: "Created Lead Generation",
        createLeadGene,
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error+"from leadGen function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}
export {
  findAllModes,
  selectMode,
  switchMode,
  directUrl,
  getDirectUrl,
  leadGen,
};
