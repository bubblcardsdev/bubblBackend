import express from "express";
import {
  deviceLink,
  deactivateDevice,
  updateLinkDevice,
  deleteDevice,
  activateDevice,
  replaceDevice,
  getDeviceLink,
} from "../controllers/device.js";
import { authenticateToken } from "./../middleware/token.js";

const router = express.Router();

router.post("/link", authenticateToken, deviceLink);
router.get("/status", authenticateToken, getDeviceLink);

router.put("/update", authenticateToken, updateLinkDevice);
router.put("/delete", authenticateToken, deleteDevice);
router.put("/deactivate", authenticateToken, deactivateDevice);
router.put("/activate", authenticateToken, activateDevice);
router.put("/replace", authenticateToken, replaceDevice);

export default router;
