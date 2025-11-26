import {
  activateDeviceServices,
  deActiveDeviceServices,
  deviceServices,
  replaceDeviceService,
  createDeviceServices,
  updateDeviceServices,
  getAllDeviceServices,
  createDeviceBulkServices,
} from "../../adminServices/deviceServices.js";
import XLSX from "xlsx";
import model from "../../models/index.js";

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

async function createDeviceBulkController(req, res) {
  const { deviceData } = req.body;
  let response = [];
  
  try {
    if (deviceData.length !== 0) {
      // Use Promise.all to wait for all async operations to finish
      response = await Promise.all(
        deviceData.map(async (record) => {
          const { deviceUid, deviceType } = record;
          const creteDeviceFunction = await createDeviceBulkServices(deviceUid, deviceType);
          console.log("creteDeviceFunction-----------", creteDeviceFunction);
          return creteDeviceFunction;
        })
      );
      
      console.log(response);
      return res.json({
        success: true,
        message: "Success",
        data: response
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid Data"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
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
async function bulkDeviceInsertCsv(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Read the Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res.status(400).json({
        success: false,
        message: "Excel is empty",
      });
    }

    // Validate data and transform
    const devices = data
      .map((row) => ({
        deviceUid: row.deviceUid,
        deviceType: row.deviceType,
        // deviceNickName: row.deviceNickName || null,
        // isActive: 1,
      }))
      .filter((d) => d.deviceUid && d.deviceType); // Remove invalid rows

    if (devices.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid rows found",
      });
    }

    // BULK INSERT — Much faster!
    const result = await model.Device.bulkCreate(devices);

    return res.json({
      success: true,
      message: "Devices inserted successfully",
      inserted: result.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}



export {
  deviceController,
  replaceDeviceController,
  deActiveDeviceController,
  activateDeviceController,
  createDeviceController,
  createDeviceBulkController,
  updateDeviceController,
  getAllServicesController,
  bulkDeviceInsertCsv
};
