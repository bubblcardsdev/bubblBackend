import express from "express";
import totalRevenueController from "../../controllers/admin/revenueController.js";

const revenueRouter = express.Router();
revenueRouter.get("/totalRevenue", totalRevenueController);

export default revenueRouter;
