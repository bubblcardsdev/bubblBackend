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
  getProductDetailsLatest
} from "../controllers/buydevice.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/alldevices", getAllDevices); //changed
router.post("/productDetails", getProductDetailsLatest); //changed


router.put("/addtocart", authenticateToken, addToCart); //changed
router.get("/all", authenticateToken, getCart); //changed but not received any response structure
router.put("/cancel", authenticateToken, cancelCart); //changed - to remove item from cart

router.get("/clearItems", authenticateToken, clearCart);

// Cart Flow before login
router.put("/addToNonUserCart", addToNonUserCart);
// router.post("/addToNonUserCart", addToNonUserCart);
router.get("/nonUser/all", getNonUserCart);
router.put("/nonUser/cancel", cancelNonUserCart);
router.post("/nonUser/clearItems", clearCartNonuser);

export default router;
