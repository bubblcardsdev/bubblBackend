import Razorpay from "razorpay"
import config from "./config.js"


const razorpay = new Razorpay({
    key_id:config.razorpayKeyId,
    key_secret:config.razorpaySecretId,
})



export default razorpay;
