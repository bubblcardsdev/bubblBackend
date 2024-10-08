import express from "express";
import {
  deviceController,
  replaceDeviceController,
  deActiveDeviceController,
  activateDeviceController,
  createDeviceController,
  updateDeviceController,
  getAllServicesController,
  createDeviceBulkController,
} from "../../controllers/admin/deviceController.js";

const deviceRouter = express.Router();
deviceRouter.post("/createDevice", createDeviceController);
deviceRouter.post("/createDeviceBulk", createDeviceBulkController);
deviceRouter.put("/updateDevice", updateDeviceController);
deviceRouter.get("/devicePrice", deviceController);
deviceRouter.put("/replaceDevice", replaceDeviceController);
deviceRouter.put("/deActiveDevice", deActiveDeviceController);
deviceRouter.put("/activateDevice", activateDeviceController);
deviceRouter.get("/allDevice", getAllServicesController);

export default deviceRouter;
