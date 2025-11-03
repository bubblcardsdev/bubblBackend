import express from "express";
import {
  getPlan,
  getPlanDetails,
  updatePlanDetails,
  deactivatePlan,
  createPlanPayment,
  getAllPlan,
  getPlanDescription,
  getUserPlan,
} from "../controllers/myPlan.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/all", getPlan);
router.get("/find", authenticateToken, getPlanDetails);
router.put("/update", authenticateToken, updatePlanDetails);
router.put("/cancel", authenticateToken, deactivatePlan);
router.post("/initiate", authenticateToken, createPlanPayment);

//V3
router.get("/findDetails", getAllPlan); // failed route remove later
router.get("/planDescription",getPlanDescription);//latest one
router.get("/user",authenticateToken,getUserPlan)

export default router;
