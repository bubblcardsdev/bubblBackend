import express from "express";
import {
  adminController,
  getAllAdmin,
} from "../../controllers/admin/adminController.js";

const adminRouterFunc = express.Router();

adminRouterFunc.put("/changePassword", adminController);
adminRouterFunc.get("/allAdmin", getAllAdmin);
export default adminRouterFunc;
