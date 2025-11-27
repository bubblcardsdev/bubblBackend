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
  bulkDeviceInsertCsv,
} from "../../controllers/admin/deviceController.js";
import { csvUpload } from "../../middleware/fileUpload.js";

const deviceRouter = express.Router();
deviceRouter.post("/createDevice", createDeviceController);
deviceRouter.post("/createDeviceBulk", createDeviceBulkController);
deviceRouter.put("/updateDevice", updateDeviceController);
deviceRouter.get("/devicePrice", deviceController);
deviceRouter.put("/replaceDevice", replaceDeviceController);
deviceRouter.put("/deActiveDevice", deActiveDeviceController);
deviceRouter.put("/activateDevice", activateDeviceController);
deviceRouter.get("/allDevice", getAllServicesController);
// deviceRouter.post("/bulkDeviceInsertCsv", csvUpload.single("file"), bulkDeviceInsertCsv);


export default deviceRouter;
