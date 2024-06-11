import express from "express";
import {
  deviceController,
  replaceDeviceController,
  deActiveDeviceController,
  activateDeviceController,
  createDeviceController,
  updateDeviceController,
  getAllServicesController,
} from "../../controllers/admin/deviceController.js";

const deviceRouter = express.Router();
deviceRouter.post("/createDevice", createDeviceController);
deviceRouter.put("/updateDevice", updateDeviceController);
deviceRouter.get("/devicePrice", deviceController);
deviceRouter.put("/replaceDevice", replaceDeviceController);
deviceRouter.put("/deActiveDevice", deActiveDeviceController);
deviceRouter.put("/activateDevice", activateDeviceController);
deviceRouter.get("/allDevice", getAllServicesController);

export default deviceRouter;
