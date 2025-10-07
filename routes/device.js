import express from "express";
import {
  deviceLink,
  deactivateDevice,
  updateLinkDevice,
  deleteDevice,
  activateDevice,
  replaceDevice,
  getDeviceLink,
  fetchCardDetails,
  getAllDevices,
  linkDevice,
  unlinkDevice,
  switchProfile,
  switchModes,
  blockDevice,
  unblockDevice,
  deviceDeactivate,
  deviceReactivate
} from "../controllers/device.js";
import { authenticateToken } from "./../middleware/token.js";

const router = express.Router();

router.post("/link", authenticateToken, deviceLink);
router.get("/status", authenticateToken, getDeviceLink);
// router.get("/status", authenticateToken, getDeviceLinkLatest);


router.put("/update", authenticateToken, updateLinkDevice);
router.put("/delete", authenticateToken, deleteDevice);
router.put("/deactivate", authenticateToken, deactivateDevice);
router.put("/activate", authenticateToken, activateDevice);
router.put("/replace", authenticateToken, replaceDevice);
router.post("/fetchCardDetails", fetchCardDetails);

// V3 Api's

router.get("/all", authenticateToken, getAllDevices);
router.post("/add", authenticateToken, linkDevice);
router.post("/remove", authenticateToken, unlinkDevice);
router.post("/switchProfile", authenticateToken, switchProfile);
router.post("/switchModes", authenticateToken, switchModes);
router.post("/block", authenticateToken, blockDevice);
router.post("/unblock", authenticateToken, unblockDevice);
router.post("/deviceDe-activate", authenticateToken, deviceDeactivate);
router.post("/deviceRe-activate", authenticateToken, deviceReactivate);

export default router;
