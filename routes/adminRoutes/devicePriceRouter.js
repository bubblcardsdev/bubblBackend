import express from "express";
import {
  allDevicePriceController,
  devicePriceController,
} from "../../controllers/admin/devicePriceController.js";

const devicePriceRouter = express.Router();

devicePriceRouter.get("/allPrice", allDevicePriceController);
devicePriceRouter.put("/priceChange", devicePriceController);
export default devicePriceRouter;
