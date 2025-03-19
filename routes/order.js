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
} from "../controllers/order.js";
import { authenticateCheckoutToken, authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/all", authenticateToken, getOrderDetails);
router.post("/one", getOrderById);
router.put("/ship", authenticateToken, updateShippingDetails);
router.post("/checkout", authenticateCheckoutToken, checkOut);
router.put("/pay", authenticateToken, proceedPayment);
router.put("/cancel", authenticateToken, cancelOrder);

// checkout flow before login
router.post("/checkoutNonUser", checkOutNonUser);
router.post("/nonUser/one", getNonUserOrderById);

export default router;
