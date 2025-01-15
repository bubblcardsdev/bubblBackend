import express from "express";

import {initialePay,verifyPayment, getShippingCharge} from "../controllers/payment.js";

const router = express.Router();

router.post("/initialePay",initialePay);
// router.post("/initialePay",initiatePayNonUser);
router.post("/verifyPayment", verifyPayment);
router.post("/shippingCharge", getShippingCharge);

export default router;


