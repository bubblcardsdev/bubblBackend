import express from "express";
import {
  findAllModes,
  selectMode,
  switchMode,
  directUrl,
  getDirectUrl,
  leadGen,
} from "../controllers/modes.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.put("/select", authenticateToken, selectMode);
router.get("/all", findAllModes);
router.put("/switch", authenticateToken, switchMode);
router.put("/directurl", directUrl);
router.post("/geturl", getDirectUrl);
router.post("/leadgen", leadGen);

export default router;
