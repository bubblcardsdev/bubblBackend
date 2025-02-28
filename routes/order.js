import express from "express";
import {
  getOrderDetails,
  getOrderById,
  updateShippingDetails,
  checkOut,
  proceedPayment,
  cancelOrder,
  checkOutNonUser,
  getNonUserOrderById,
  freeCardDesign,
} from "../controllers/order.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();


router.post("/freeCardDesign",freeCardDesign);
router.get("/all", authenticateToken, getOrderDetails);
router.post("/one", authenticateToken, getOrderById);
router.put("/ship", authenticateToken, updateShippingDetails);
router.post("/checkout", authenticateToken, checkOut);
router.put("/pay", authenticateToken, proceedPayment);
router.put("/cancel", authenticateToken, cancelOrder);

// checkout flow before login
router.post("/checkoutNonUser", checkOutNonUser);
router.post("/nonUser/one", getNonUserOrderById);

export default router;
