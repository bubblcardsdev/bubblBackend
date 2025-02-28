import express from "express";
import {
  getAllDevices,
  addToCart,
  getCart,
  cancelCart,
  clearCart,
  addToNonUserCart,
  getNonUserCart,
  cancelNonUserCart,
  clearCartNonuser,
  productList
} from "../controllers/buydevice.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/alldevices", getAllDevices);
router.post("/productList",productList);
router.put("/addtocart", authenticateToken, addToCart);
router.get("/all", authenticateToken, getCart);
router.put("/cancel", authenticateToken, cancelCart);
router.get("/clearItems", authenticateToken, clearCart);

// Cart Flow before login
router.put("/addToNonUserCart", addToNonUserCart);
// router.post("/addToNonUserCart", addToNonUserCart);
router.get("/nonUser/all", getNonUserCart);
router.put("/nonUser/cancel", cancelNonUserCart);
router.post("/nonUser/clearItems", clearCartNonuser);

export default router;
