import {
  activateDeviceServices,
  deActiveDeviceServices,
  deviceServices,
  replaceDeviceService,
  createDeviceServices,
  updateDeviceServices,
  getAllDeviceServices,
} from "../../adminServices/deviceServices.js";

async function deviceController(req, res) {
  const allDeviceDetails = await deviceServices();
  return res.json({
    allDeviceDetails,
  });
}

async function replaceDeviceController(req, res) {
  const { userId, deviceUid, deviceId } = req.body;
  try {
    const replaceDevice = await replaceDeviceService(
      res,
      userId,
      deviceUid,
      deviceId
    );

    return replaceDevice;
  } catch (error) {
    console.log(error);
  }
}

async function deActiveDeviceController(req, res) {
  const { userId, accountDeviceLinkId } = req.body;
  try {
    const deActiveDevice = await deActiveDeviceServices(
      res,
      userId,
      accountDeviceLinkId
    );

    return deActiveDevice;
  } catch (error) {
    console.log(error);
  }
}

async function activateDeviceController(req, res) {
  const { userId, accountDeviceLinkId } = req.body;
  try {
    const activateFunction = await activateDeviceServices(
      res,
      userId,
      accountDeviceLinkId
    );
    return activateFunction;
  } catch (error) {
    console.log(error);
  }
}

// create a device function

async function createDeviceController(req, res) {
  const { deviceUid, deviceType } = req.body;
  try {
    const creteDeviceFunction = await createDeviceServices(
      res,
      deviceUid,
      deviceType
    );
    return creteDeviceFunction;
  } catch (error) {
    console.log(error);
  }
}

async function updateDeviceController(req, res) {
  const { deviceId, deviceUid } = req.body;
  try {
    const creteDeviceFunction = await updateDeviceServices(
      res,
      deviceId,
      deviceUid
    );
    return creteDeviceFunction;
  } catch (error) {
    console.log(error);
  }
}

async function getAllServicesController(req, res) {
  try {
    const getDevice = await getAllDeviceServices();
    return res.json({
      success: true,
      getDevice,
    });
  } catch (e) {
    console.log(e);
  }
}

export {
  deviceController,
  replaceDeviceController,
  deActiveDeviceController,
  activateDeviceController,
  createDeviceController,
  updateDeviceController,
  getAllServicesController,
};
