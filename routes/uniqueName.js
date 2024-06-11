import express from "express";
import {
  uniqueUserName,
  getUniqueName,
} from "../controllers/uniqueNameDeviceLink.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.put("/name", authenticateToken, uniqueUserName);
router.post("/getName", getUniqueName);

export default router;
