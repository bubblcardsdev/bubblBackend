import express from "express";
import {
  FullyCustomController,
  FullyCustomNonUserController,
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

// non user fully custom controller
fullyCustomRouter.post(
  "/nonUser/fullyCustom",
  FullyCustomNonUserController
);
export default fullyCustomRouter;
