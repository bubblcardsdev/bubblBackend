import express from "express";
import {
  planController,
  planPaymentController,
  updatePlanController,
  getPlanDetailsController,
} from "../../controllers/admin/planController.js";

const planRouter = express.Router();

planRouter.get("/planDetails", planController);
planRouter.get("/planPayment", planPaymentController);
planRouter.put("/updatePlan", updatePlanController);
planRouter.post("/getPlanDetails", getPlanDetailsController);

export default planRouter;
