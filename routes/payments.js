import express from "express";

import {initialePay,verifyPayment, getShippingCharge,initialePayLatest,initiatePayNew, initiatePayRazorPay, verifyPaymentRazorPay, handlePaymentFailure} from "../controllers/payment.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

// router.post("/initialePay",initialePay);
// router.post("/initialePay",initialePayLatest);

router.post("/initialePay",initiatePayNew);

// router.post("/initialePay",initiatePayNonUser);
// router.post("/verifyPayment", verifyPayment);
router.post("/shippingCharge", getShippingCharge);



// v3 Apis

router.post("/initiatePay",initiatePayRazorPay)
router.post("/verifyPayment",authenticateToken,verifyPaymentRazorPay) // send mail to user
router.post("/failurePayment",authenticateToken,handlePaymentFailure)





export default router;


