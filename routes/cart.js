import express from "express";
import {
  getAllDevices,
  addToCart,
  getCart,
  cancelCart,
  clearCart
} from "../controllers/buydevice.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/alldevices", getAllDevices);
router.put("/addtocart", authenticateToken, addToCart);
router.get("/all", authenticateToken, getCart);
router.put("/cancel", authenticateToken, cancelCart);
router.get("/clearItems", authenticateToken, clearCart);

export default router;
