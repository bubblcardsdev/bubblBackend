import express from "express";
import {
  getPlan,
  getPlanDetails,
  updatePlanDetails,
  deactivatePlan,
  createPlanPayment,
  getAllPlan,
} from "../controllers/myPlan.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/all", getPlan);
router.get("/find", authenticateToken, getPlanDetails);
router.put("/update", authenticateToken, updatePlanDetails);
router.put("/cancel", authenticateToken, deactivatePlan);
router.post("/initiate", authenticateToken, createPlanPayment);

//V3
router.get("/findDetails", getAllPlan);

export default router;
