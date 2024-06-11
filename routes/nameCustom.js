import express from "express";
import {
  nameCustomController,
  getImageByCardController,
  getCardImageByIdController,
  getCardImageByTypeController,
} from "../controllers/nameCustom.js";
import { authenticateToken } from "../middleware/token.js";

const nameRouter = express.Router();
nameRouter.post("/nameCustom", authenticateToken, nameCustomController);
nameRouter.get("/getThumbnailImages", getImageByCardController);
nameRouter.put("/getCardImageById", getCardImageByIdController);
nameRouter.put("/patternImages", getCardImageByTypeController);

export default nameRouter;
