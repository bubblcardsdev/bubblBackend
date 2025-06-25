import express from "express";

import {initialePay,verifyPayment, getShippingCharge,initialePayLatest} from "../controllers/payment.js";

const router = express.Router();

// router.post("/initialePay",initialePay);
router.post("/initialePay",initialePayLatest);


// router.post("/initialePay",initiatePayNonUser);
router.post("/verifyPayment", verifyPayment);
router.post("/shippingCharge", getShippingCharge);

export default router;


