import express from "express";
import {
  getUserDetailsController,
  userCountController,
} from "../../controllers/admin/userController.js";

const adminRouter = express.Router();
adminRouter.get("/getAllUsers", getUserDetailsController);
adminRouter.get("/userCount", userCountController);

export default adminRouter;
