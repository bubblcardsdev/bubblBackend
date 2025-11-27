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
  createOrder,
  getPromo,
  createPlanOrder
} from "../controllers/order.js";
import { authenticateCheckoutToken, authenticateToken } from "../middleware/token.js";

const router = express.Router();


router.get("/all", authenticateToken, getOrderDetails);
router.post("/one",authenticateToken, getOrderById);
router.put("/ship", authenticateToken, updateShippingDetails);
router.post("/checkout", authenticateCheckoutToken, checkOut); //changed - both logged in and guest user can use this. 
router.put("/pay", authenticateToken, proceedPayment);
router.put("/cancel", authenticateToken, cancelOrder);

// checkout flow before login
router.post("/checkoutNonUser", checkOutNonUser);
router.post("/nonUser/one", getNonUserOrderById);

// v3 Api

router.post("/createOrder",authenticateToken,createOrder);
router.post("/applyPromo", authenticateToken, getPromo);
router.post("/createPlanOrder",authenticateToken,createPlanOrder)




export default router;
