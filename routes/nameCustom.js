import express from "express";
import {
  nameCustomController,
  getImageByCardController,
  getCardImageByIdController,
  getCardImageByTypeController,
  nameCustomNonUserController,
} from "../controllers/nameCustom.js";
import { authenticateToken } from "../middleware/token.js";

const nameRouter = express.Router();
nameRouter.post("/nameCustom", authenticateToken, nameCustomController);
nameRouter.get("/getThumbnailImages", getImageByCardController);
nameRouter.put("/getCardImageById", getCardImageByIdController);
nameRouter.put("/patternImages", getCardImageByTypeController);

// nonuser name custom controller
nameRouter.post("/nonUser/nameCustom", nameCustomNonUserController);

export default nameRouter;
