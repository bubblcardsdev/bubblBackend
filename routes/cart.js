import express from "express";
import {
  getAllDevices,
  addToCart,
  getCart,
  cancelCart,
  clearCart,
  addToNonUserCart,
  getNonUserCart,
  cancelNonUserCart
} from "../controllers/buydevice.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/alldevices", getAllDevices);
router.put("/addtocart", authenticateToken, addToCart);
router.get("/all", authenticateToken, getCart);
router.put("/cancel", authenticateToken, cancelCart);
router.get("/clearItems", authenticateToken, clearCart);

// Cart Flow before login
router.put("/addToNonUserCart", addToNonUserCart);
// router.post("/addToNonUserCart", addToNonUserCart);
router.get("/nonUser/all", getNonUserCart);
router.put("/nonUser/cancel", cancelNonUserCart);
router.get("/nonUser/clearItems", clearCart);

export default router;
