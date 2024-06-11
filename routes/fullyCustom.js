import express from "express";
import {
  FullyCustomController,
  getPriceController,
} from "../controllers/fullyCustomController.js";
import { authenticateToken } from "../middleware/token.js";

const fullyCustomRouter = express.Router();

fullyCustomRouter.post(
  "/fullyCustom",
  authenticateToken,
  FullyCustomController
);
fullyCustomRouter.get("/getPrice", getPriceController);
export default fullyCustomRouter;
