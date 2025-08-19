import express from "express";
import {
  getLeadsDetails,
  getAnalyticsDetails,
  getTapsDataByDevice,
  getModeUsageByDevice,
  getSocailTapsByDevice,
  getPaymentsTaps,
  getContactsTapsByDevice,
  getLeadGenDataByDeviceId,
  getUserDevices,
  getDeviceTypes,
  getOverView,
  createTapDetails,
} from "../controllers/analytics.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.post("/tapDetails", createTapDetails);
router.get("/getLeads", authenticateToken, getLeadsDetails);
router.put("/getAnalytics", authenticateToken, getAnalyticsDetails);
router.put("/getTapsData", authenticateToken, getTapsDataByDevice);
router.put("/getModeUsage", authenticateToken, getModeUsageByDevice);
router.put("/getSocialTaps", authenticateToken, getSocailTapsByDevice);
router.put("/getPaymentTaps", authenticateToken, getPaymentsTaps);
router.put("/getContactTaps", authenticateToken, getContactsTapsByDevice);
router.put("/getLeadGenData", authenticateToken, getLeadGenDataByDeviceId);
router.get("/getUserDevices", authenticateToken, getUserDevices);
router.put("/getDeviceType", authenticateToken, getDeviceTypes);
router.get("/getOverView",authenticateToken,getOverView)

export default router;
