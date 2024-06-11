import express from "express";
import {
  getAllOrders as getAllOrdersController,
  getOrderByController,
  getOrdersCount,
  getPendingOrderCountController,
  updateOrderController,
  getShippedController,
} from "../../controllers/admin/orderController.js";

const orderRouter = express.Router();

orderRouter.get("/getNonShippedOrders", getAllOrdersController);
orderRouter.get("/getOrderCount", getOrdersCount);
orderRouter.get("/pendingCount", getPendingOrderCountController);
orderRouter.put("/orderById", getOrderByController);
orderRouter.put("/updateOrder", updateOrderController);
orderRouter.get("/getShippingOrders", getShippedController);

export default orderRouter;
