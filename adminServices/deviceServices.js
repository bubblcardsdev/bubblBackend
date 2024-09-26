import model from "../models/index.js";

async function deviceServices() {
  const deviceDetails = await model.DeviceInventory.findAll();
  return deviceDetails;
}

async function replaceDeviceService(res, userId, deviceUid, deviceId) {
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
    console.log(error);
  }
}

// Func for deactive  Device Services

async function deActiveDeviceServices(res, userId, accountDeviceLinkId) {
  const checkUserId = await model.DeviceLink.findOne({
    // check user Id from user table
    where: {
      userId: userId,
    },
  });
  if (checkUserId) {
    const checkProfile = await model.DeviceLink.findOne({
      // check the accountdeviceLink id from deviceLink table
      where: {
        accountDeviceLinkId,
      },
    });
    if (checkProfile) {
      const deviceStatus = checkProfile.activeStatus;
      const value = false;
      if (deviceStatus === true) {
        await model.DeviceLink.update(
          // update query for updating the status
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
      }
    }
  } else {
    return res.json({
      success: false,
      message: "Invalid User",
    });
  }
}
//  activate device function
async function activateDeviceServices(res, userId, accountDeviceLinkId) {
  const checkUserId = await model.DeviceLink.findOne({
    // check user Id from user table
    where: {
      userId: userId,
    },
  });
  if (checkUserId) {
    const checkProfile = await model.DeviceLink.findOne({
      // check the accountdeviceLink id from deviceLink table
      where: {
        accountDeviceLinkId,
      },
    });
    if (checkProfile) {
      const deviceStatus = checkProfile.activeStatus;
      const value = true;
      if (deviceStatus === false) {
        await model.DeviceLink.update(
          // update query for updating the status
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
          message: "Device Activated",
        });
      }
    }
  } else {
    return res.json({
      success: false,
      message: "Invalid User",
    });
  }
}

// post device function
async function createDeviceServices(res, deviceUid, deviceType) {
  const checkDeviceId = await model.Device.findOne({
    where: {
      deviceUid: deviceUid,
    },
  });
  if (checkDeviceId === null) {
    const deviceFunction = await model.Device.create({
      deviceUid: deviceUid,
      deviceType: deviceType,
    });
    return res.json({
      success: true,
      deviceFunction,
    });
  } else {
    return res.json({
      success: false,
      message: "Device exist",
    });
  }
}

async function createDeviceBulkServices(deviceUid, deviceType) {
  const checkDeviceId = await model.Device.findOne({
    where: {
      deviceUid: deviceUid,
    },
  });
  if (checkDeviceId === null) {
     await model.Device.create({
      deviceUid: deviceUid,
      deviceType: deviceType,
    });
     return {deviceId:deviceUid,response:"Successfully Created"}
  } else {
    return {deviceId:deviceUid,response:"Device Already Exists"}
  }
}

// update the device number
async function updateDeviceServices(res, deviceId, deviceUid) {
  const updateDeviceServices = await model.Device.update(
    {
      deviceUid: deviceUid,
    },
    {
      where: {
        id: deviceId,
      },
    }
  );
  return res.json({
    updateDeviceServices,
  });
}

// func for getting all the devices

async function getAllDeviceServices() {
  const getAllDevice = await model.Device.findAll();
  return getAllDevice;
}
export {
  deviceServices,
  replaceDeviceService,
  deActiveDeviceServices,
  activateDeviceServices,
  createDeviceServices,
  updateDeviceServices,
  getAllDeviceServices,
  createDeviceBulkServices
};
