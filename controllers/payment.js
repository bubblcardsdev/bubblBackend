/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-useless-catch */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unreachable */

import { encrypt, decrypt } from "../helper/ccavutil.js";
import qs from "querystring";
import model from "../models/index.js";
const workingKey = config.paymentWorkingKey;
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import OrderConfirmationMail from "./orderEmail.js";
import NameCustomEmail from "./namCustomEmail.js";
import loggers from "../config/logger.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import {
  initiatePayValidation,
  verifyPaymentValidation,
} from "../validations/payment.js";

import ValidateOrder from "../validations/order.js";
import mode from "../models/mode.cjs";
import { Op } from "sequelize";
import razorpay from "../config/razorPay.js";
import { verifyRazorpaySignature } from "../services/productService.js";

async function initialePay(req, res) {
  try {
    const paymentObj = req.body;

    const { error } = initiatePayValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(500)
        .json({ success: false, data: { error: error.details } });
    }

    const orderId = paymentObj.orderId;
    console.log("orderId-------------------------------------", orderId);
    let getDataForPayment;

    const decodedToken = atob(paymentObj.token);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedToken);
    const isJWT = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(
      decodedToken
    );

    if (Number(paymentObj.orderType) === 0) {
      if (!isJWT) {
        return res.status(400).json({
          success: false,
          message: "Required Logged in user's identity",
        });
      }

      getDataForPayment = await getDataForPaymentService(
        orderId,
        decodedToken,
        isEmail,
        isJWT
      );
    } else if (Number(paymentObj.orderType) === 2) {
      if (!isEmail) {
        return res.status(400).json({
          success: false,
          message: "Required Guest user's identity",
        });
      }
      getDataForPayment = await getDataForPaymentService(
        orderId,
        decodedToken,
        isEmail,
        isJWT
      );
    } else if (Number(paymentObj.orderType) === 1) {
      throw new Error("Plan payment to be handled as part of post login");
      getDataForPayment = await getDataForPlanPaymentService(
        paymentObj.planType
      );
    } else {
      // default case to handle unexpected order types
      return res.status(400).json({
        success: false,
        message: "Invalid order type",
      });
    }
    console.log(getDataForPayment, "getDataForPayment");

    const orderType = paymentObj.orderType;

    let token =
      orderType == 1 ? btoa(getDataForPayment?.email) : paymentObj.token;

    const cost =
      getDataForPayment.shippingCost !== undefined
        ? Number(getDataForPayment.shippingCost)
        : 0;

    console.log(cost, orderType, "costsss");

    const totalAmount =
      getDataForPayment?.email == "kishorekk54321@gmail.com"
        ? 1
        : getDataForPayment.totalPrice;

    const planType = paymentObj.planType === 0 ? "monthly" : "yearly";

    const shippingCost = cost.toString();

    console.log(totalAmount, "value");
    console.log("token", orderType, orderId, planType, shippingCost);

    //Put in the 32-Bit key shared by CCAvenues.
    const accessCode = config.paymentAccessCode;

    let encRequest = "";
    let formbody = "";

    let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fcustom-api%2Fpost&cancel_url=http%3A%2F%2Flocalhost%3A3000%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;

    // let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=https%3A%2F%2Fdev.bubbl.cards%2Fcustom-api%2Fpost&cancel_url=https%3A%2F%2Fdev.bubbl.cards%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;

    // let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=https%3A%2F%2Fbubbl.cards%2Fcustom-api%2Fpost&cancel_url=https%3A%2F%2Fbubbl.cards%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;
    encRequest = encrypt(bodyData, workingKey);
    const POST = qs.parse(bodyData);
    // live
    // formbody =
    //   '<html><head><title>Sub-merchant checkout page</title><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script></head><body><center><!-- width required mininmum 482px --><iframe  width="100%" style="height:100vh"  frameborder="0"  id="paymentFrame" src="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&merchant_id=' +
    //   POST.merchant_id +
    //   "&encRequest=" +
    //   encRequest +
    //   "&access_code=" +
    //   accessCode +
    //   '"></iframe></center><script type="text/javascript">$(document).ready(function(){$("iframe#paymentFrame").load(function() {window.addEventListener("message", function(e) {$("#paymentFrame").css("height",e.data["newHeight"]+"px"); }, false);}); });</script></body></html>';
    // test
    formbody =
      '<html><head><title>Sub-merchant checkout page</title><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script></head><body><center><!-- width required mininmum 482px --><iframe  width="100%" style="height:100vh"  frameborder="0"  id="paymentFrame" src="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&merchant_id=' +
      POST.merchant_id +
      "&encRequest=" +
      encRequest +
      "&access_code=" +
      accessCode +
      '"></iframe></center><script type="text/javascript">$(document).ready(function(){$("iframe#paymentFrame").load(function() {window.addEventListener("message", function(e) {$("#paymentFrame").css("height",e.data["newHeight"]+"px"); }, false);}); });</script></body></html>';

    console.log("encRequest-----------------", encRequest, "-----------------");
    console.log(formbody);

    return res.json({
      success: true,
      message: "Payment initiated Successfully",

      data: {
        formbody,
      },
    });
  } catch (error) {
    console.log("Error", error);
    loggers.error(error + "from initialePay function");
    return res.status(500).json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function initialePayLatest(req, res) {
  try {
    const paymentObj = req.body;

    const { error } = initiatePayValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(500)
        .json({ success: false, data: { error: error.details } });
    }

    const orderId = paymentObj.orderId;

    console.log("orderId-------------------------------------", orderId);
    let getDataForPayment;

    const decodedToken = Buffer.from(paymentObj.token, "base64").toString(
      "utf-8"
    );
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedToken);
    const isJWT = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(
      decodedToken
    );

    const validOrder = await ValidateOrder(orderId, decodedToken);
    if (!validOrder) {
      return res.status(400).json({
        success: false,
        message: "Not a valid order",
      });
    }

    if (
      Number(paymentObj.orderType) === 1 &&
      ![0, 1].includes(paymentObj.planType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Plan type is needed for upgrading plan",
      });
      // throw new Error("Plan type is needed for upgrading plan");
    }

    getDataForPayment = await getDataForPaymentService(
      orderId,
      decodedToken,
      isEmail,
      isJWT
    );

    console.log(getDataForPayment, "getDataForPayment");

    const orderType = paymentObj.orderType;

    let token =
      orderType == 1
        ? Buffer.from(paymentObj.token, "base64").toString("utf-8")
        : paymentObj.token;

    const cost =
      getDataForPayment.shippingCost !== undefined
        ? Number(getDataForPayment.shippingCost)
        : 0;

    console.log(cost, orderType, "costsss");

    const totalAmount =
      getDataForPayment?.email == "kishorekk54321@gmail.com"
        ? 1
        : getDataForPayment.totalPrice;

    const planType = paymentObj.planType === 0 ? "monthly" : "yearly";

    const shippingCost = cost.toString();

    console.log(totalAmount, "value");
    console.log("token", orderType, orderId, planType, shippingCost);

    //Put in the 32-Bit key shared by CCAvenues.
    const accessCode = config.paymentAccessCode;

    let encRequest = "";
    let formbody = "";

    // let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fcustom-api%2Fpost&cancel_url=http%3A%2F%2Flocalhost%3A3000%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;
    let rawBodyData = `merchant_id=${config.merchant_id}&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=${config.paymentRedirectUri}&cancel_url=${config.paymentRedirectUri}&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;
    // let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=https%3A%2F%2Fdev.bubbl.cards%2Fcustom-api%2Fpost&cancel_url=https%3A%2F%2Fdev.bubbl.cards%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;

    // let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=https%3A%2F%2Fbubbl.cards%2Fcustom-api%2Fpost&cancel_url=https%3A%2F%2Fbubbl.cards%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;
    let bodyData = encodeURIComponent(rawBodyData);
    encRequest = encrypt(bodyData, workingKey);
    const POST = qs.parse(bodyData);
    // live
    // formbody =
    //   '<html><head><title>Sub-merchant checkout page</title><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script></head><body><center><!-- width required mininmum 482px --><iframe  width="100%" style="height:100vh"  frameborder="0"  id="paymentFrame" src="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&merchant_id=' +
    //   POST.merchant_id +
    //   "&encRequest=" +
    //   encRequest +
    //   "&access_code=" +
    //   accessCode +
    //   '"></iframe></center><script type="text/javascript">$(document).ready(function(){$("iframe#paymentFrame").load(function() {window.addEventListener("message", function(e) {$("#paymentFrame").css("height",e.data["newHeight"]+"px"); }, false);}); });</script></body></html>';
    // test
    formbody =
      '<html><head><title>Sub-merchant checkout page</title><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script></head><body><center><!-- width required mininmum 482px --><iframe  width="100%" style="height:100vh"  frameborder="0"  id="paymentFrame" src="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&merchant_id=' +
      POST.merchant_id +
      "&encRequest=" +
      encRequest +
      "&access_code=" +
      accessCode +
      '"></iframe></center><script type="text/javascript">$(document).ready(function(){$("iframe#paymentFrame").load(function() {window.addEventListener("message", function(e) {$("#paymentFrame").css("height",e.data["newHeight"]+"px"); }, false);}); });</script></body></html>';

    console.log("encRequest-----------------", encRequest, "-----------------");
    console.log(formbody);

    return res.json({
      success: true,
      message: "Payment initiated Successfully",

      data: {
        formbody,
      },
    });
  } catch (error) {
    console.log("Error", error);
    loggers.error(error + "from initialePay function");
    return res.status(500).json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function initiatePayNew(req, res) {
  try {
    console.log("initialePayNew", req.body);
    const paymentObj = req?.body;

    const { error } = initiatePayValidation.validate(req?.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(500)
        .json({ success: false, data: { error: error.details } });
    }

    const { orderId, orderType, token } = paymentObj;

    const decodedToken = atob(paymentObj.token);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedToken);
    const isJWT = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(
      decodedToken
    );

    if (!isEmail && !isJWT) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    let orderData;
    let user;
    let formbody = "";

    if (isEmail) {
      console.log({
        id: orderId,
        email: decodedToken,
        orderStatusId: 1,
        isLoggedIn: false,
      });
      orderData = await model.Order.findOne({
        where: {
          id: orderId,
          email: decodedToken,
          orderStatusId: 1,
          isLoggedIn: false,
        },
      });
      console.log("orderData", orderData);
    } else if (isJWT) {
      const customer = jwt.verify(decodedToken, config.accessSecret);
      const checkUser = await model.User.findOne({
        where: {
          id: customer.id,
        },
      });
      if (!checkUser) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
      user = checkUser;
      orderData = await model.Order.findOne({
        where: {
          id: orderId,
          customerId: customer.id,
          orderStatusId: 1,
          isLoggedIn: true,
        },
      });
    }

    if (!orderData) {
      return res.status(400).json({
        success: false,
        message: "Order not found",
      });
    }

    let rawBodyData = "";

    if (orderType === 1) {
      // if (orderData.isPlan) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Payment not available for this order type",
      //   });
      // }
      const shippingDetails = await model.Shipping.findOne({
        where: {
          orderId: orderId,
        },
      });

      if (!shippingDetails) {
        return res.status(400).json({
          success: false,
          message: "Shipping details not found",
        });
      }
      const billing_name = isEmail
        ? `${shippingDetails.firstName} ${shippingDetails.lastName}`
        : `${user.firstName} ${user.lastName}`;
      const billing_address = `${shippingDetails.flatNumber}, ${shippingDetails.address}`;
      const billing_email = isEmail ? shippingDetails.emailId : user.email;

      const shippingCost = Number(orderData.shippingCharge) || 0;

      const totalAmount = Number(orderData.soldPrice) + shippingCost;
      rawBodyData = `merchant_id=${config.merchant_id}&order_id=${orderId}&currency=INR&amount=${totalAmount}&redirect_url=${config.paymentRedirectUri}&cancel_url=${config.paymentRedirectUri}&language=EN&billing_name=${billing_name}&billing_address=${billing_address}&merchant_param1=${token}&merchant_param2=${orderType}&billing_city=${shippingDetails.city}&billing_state=${shippingDetails.state}&billing_zip=${shippingDetails.pincode}&billing_country=${shippingDetails.country}&billing_tel=${shippingDetails.phoneNumber}&billing_email=${billing_email}&integration_type=iframe_normal&promo_code=&customer_identifier=`;
    }

    if (orderType === 2) {
      // if (!orderData.isPlan) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Payment not available for this order type",
      //   });
      // }
      const billing_name = `${user.firstName} ${user.lastName}`;
      rawBodyData = `merchant_id=${
        config.merchant_id
      }&order_id=${orderId}&currency=INR&amount=${
        orderData.soldPrice
      }&redirect_url=${config.paymentRedirectUri}&cancel_url=${
        config.paymentRedirectUri
      }&language=EN&billing_name=${billing_name}&merchant_param1=${token}&merchant_param2=${orderType}&billing_tel=${
        user?.phoneNumber || ""
      }&billing_email=${
        user.email
      }&integration_type=iframe_normal&promo_code=&customer_identifier=`;
    }
    const bodyData = encodeURIComponent(rawBodyData);
    const encRequest = encrypt(bodyData, workingKey);

    const POST = qs.parse(bodyData);

    formbody =
      '<html><head><title>Sub-merchant checkout page</title><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script></head><body><center><!-- width required mininmum 482px --><iframe  width="100%" style="height:100vh"  frameborder="0"  id="paymentFrame" src="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&merchant_id=' +
      POST.merchant_id +
      "&encRequest=" +
      encRequest +
      "&access_code=" +
      accessCode +
      '"></iframe></center><script type="text/javascript">$(document).ready(function(){$("iframe#paymentFrame").load(function() {window.addEventListener("message", function(e) {$("#paymentFrame").css("height",e.data["newHeight"]+"px"); }, false);}); });</script></body></html>';

    console.log("encRequest-----------------", encRequest, "-----------------");
    console.log(formbody);

    return res.json({
      success: true,
      message: "Payment initiated Successfully",

      data: {
        formbody,
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      data: { message: e?.message || "Internal Server Error" },
    });
  }
}

async function initiatePayRazorPay(req, res) {
  try {
    console.log("initiatePayNew", req.body);

    const { error } = initiatePayValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, data: { error: error.details } });
    }

    const { orderId, token } = req.body;
    const decodedToken = Buffer.from(token, "base64").toString("ascii");

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedToken);
    const isJWT = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(
      decodedToken
    );

    if (!isEmail && !isJWT) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    let orderData;
    let user;

    if (isEmail) {
      orderData = await model.Order.findOne({
        where: {
          id: orderId,
          email: decodedToken,
          orderStatusId: 1,
          isLoggedIn: false,
        },
      });
    } else if (isJWT) {
      const customer = jwt.verify(decodedToken, config.accessSecret);
      user = await model.User.findByPk(customer.id);
      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "User not found" });

      orderData = await model.Order.findOne({
        where: {
          id: orderId,
          customerId: customer.id,
          orderStatusId: 1,
          isLoggedIn: true,
        },
      });
    }

    if (!orderData)
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });

    // Calculate total amount
    const totalAmount =
      Number(orderData.soldPrice) + Number(orderData.shippingCharge || 0);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `order_${orderData.id}_${Date.now()}`,
      notes: {
        orderId: orderData.id,
        email: isEmail ? decodedToken : user.email,
        planId: orderData.planId || null, // optional
      },
    });

    // Update order table with razorpayOrderId and paymentStatus
    await orderData.update({
      razorpayOrderId: razorpayOrder.id,
      orderStatusId: 1,
    });

    res.json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      data: { message: e.message || "Internal Server Error" },
    });
  }
}

const successEnum = {
  Success: true,
  Failure: false,
  Aborted: false,
};

async function verifyPayment(req, res) {
  try {
    const encData = req.body.data;

    const { error } = verifyPaymentValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(500)
        .json({ success: false, data: { error: error.details } });
    }

    console.log(encData, "encData");
    const ccavResponse = decrypt(encData, workingKey);

    console.log(ccavResponse, "ccavResponse");
    const params = new URLSearchParams(ccavResponse);
    console.log(params, "params");
    const obj = Object.fromEntries(params.entries());
    console.log(obj, "obj");

    const token = atob(obj.merchant_param1);

    let userId = 0;

    if (obj?.billing_address != "1") {
      try {
        console.log("came in", token);
        const tokenData = jwt.verify(token, config.accessSecret);

        console.log(tokenData, "tokenDatadfdfd");
        userId = tokenData.id;
      } catch (e) {
        console.log(e);
        // console.log("failed to verify token");
      }
    }

    userId = userId === 0 ? null : userId;

    // obj.order_status = "Success"; //comment this before live

    const cost = obj.merchant_param2;
    const shippingCost = Number(cost);

    const checkOrder = await model.Order.findOne({
      where: {
        id: Number(obj.order_id),
        orderStatusId: 3,
      },
    });
    if (checkOrder) {
      throw new Error("Order already completed");
    }

    const shipping = await model.Shipping.findOne({
      where: {
        orderId: Number(obj.order_id),
      },
    });
    console.log(
      shipping?.dataValues?.emailId,
      successEnum[obj.order_status],
      "shippinghhhvj"
    );

    let email = shipping?.dataValues?.emailId || null;

    if (successEnum[obj.order_status] === true) {
      switch (obj.billing_address) {
        case "0":
        case "2":
          console.log("came in 0 or 2");
          await model.Payment.create({
            transactionId: obj.tracking_id,
            bankRefNo: obj.bank_ref_no,
            customerId: userId || null,
            orderId: obj.order_id,
            paymentStatus: successEnum[obj.order_status],
            failureMessage: obj.failure_message,
            shippingCharge: shippingCost,
            amount: obj.amount,
            isLoggedIn: !!userId,
            email: email,
            paymentMethod: obj.payment_mode + " " + obj.card_name,
          });

          await model.Order.update(
            {
              orderStatusId: 3,
            },
            {
              where: {
                id: Number(obj.order_id),
              },
            }
          );

          const checkPaymentStatus = await model.Payment.findOne({
            where: {
              orderId: Number(obj.order_id),
              paymentStatus: true,
            },
          });

          console.log("____________________________________________");

          if (checkPaymentStatus) {
            const checkDeviceType = await model.OrderBreakDown.findAll({
              where: {
                orderId: Number(obj.order_id),
              },
            });
            console.log(checkDeviceType, obj.order_id, "checkDeviceType");
            console.log("______________________________________________");
            const products = await Promise.all(
              checkDeviceType.map(async (f) => {
                console.log(f.productId, "fdfdfd");
                const getProductDetail = await model.DeviceInventories.findOne({
                  where: { id: f.productId },
                  include: [{ model: model.DeviceImageInventories }],
                });
                console.log(getProductDetail, "fdfdfd");

                const imageUrls = await Promise.all(
                  (getProductDetail.DeviceImageInventories || []).map((img) =>
                    generateSignedUrl(img.imageKey)
                  )
                );

                const getFontName = await model.CustomFontMaster.findOne({
                  where: { id: f.fontId },
                });

                if (userId) {
                  const findCartItem = await model.Cart.findOne({
                    where: {
                      productId: f.productId,
                      customerId: userId,
                      productStatus: true,
                    },
                  });

                  if (findCartItem) {
                    await model.Cart.update(
                      { productStatus: false },
                      {
                        where: {
                          id: findCartItem.id,
                          customerId: userId,
                        },
                      }
                    );
                  }
                }

                return {
                  productId: f.productId,
                  productPrimaryImage: imageUrls[0],
                  productSecondaryImage: imageUrls[1],
                  deviceType: getProductDetail.deviceTypeId,
                  font: getFontName?.name || null,
                  customName: f.nameOnCard || null,
                  productName: getProductDetail.name,
                  productPrice: getProductDetail.price,
                  quantity: f.quantity,
                };
              })
            );

            const nameCustomProducts = products.filter(
              (product) => product.deviceType === 6
            );

            const otherProducts = products.filter(
              (product) => product.deviceType !== 6
            );

            if (nameCustomProducts.length > 0) {
              NameCustomEmail(nameCustomProducts, obj.order_id);
            }

            if (otherProducts.length > 0) {
              OrderConfirmationMail(otherProducts, obj.order_id, userId);
            }
          }
          console.log("came here after order confirmation mail");
          return res.json({
            success: true,
            message: "Payment verified successfully",
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
              orderType: obj.billing_address,
            },
          });
        case "1":
          await model.PlanPayment.update(
            {
              transactionId: obj.tracking_id,
              bankRefNo: obj.bank_ref_no,
              planId: 2,
              totalPrice: Number(obj.amount),
              paymentStatus: successEnum[obj.order_status],
              failureMessage: obj.failure_message,
            },
            {
              where: {
                id: Number(obj.order_id),
              },
            }
          );

          return res.json({
            success: true,
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
              paymentMode: obj.payment_mode,
              planType: obj.billing_name,
              orderType: obj.billing_address,
              jwtToken: token,
            },
          });
      }
    } else if (
      successEnum[obj.order_status] === false &&
      obj.order_status == "Aborted"
    ) {
      switch (obj.billing_address) {
        case "0":
        case "2":
          console.log("came in 0");
          await model.Payment.create({
            transactionId: obj?.tracking_id,
            bankRefNo: obj?.bank_ref_no,
            customerId: userId || null,
            orderId: obj.order_id,
            paymentStatus: successEnum[obj.order_status] || false,
            failureMessage: obj.status_message,
            shippingCharge: shippingCost,
            amount: obj.amount,
            isLoggedIn: userId ? true : false,
            email: email,
          });

          await model.Order.update(
            {
              orderStatusId: 2,
            },
            { where: { id: Number(obj.order_id) } }
          );

          return res.status(200).json({
            success: false,
            data: {
              orderId: Number(obj.order_id),
              message: obj.status_message || obj.order_status,
              orderType: obj.billing_address,
            },
          });

        case "1":
          await model.PlanPayment.update({
            transactionId: obj.tracking_id,
            bankRefNo: obj.bank_ref_no,
            customerId: userId || null,
            id: obj.order_id,
            paymentStatus: successEnum[obj.order_status],
            failureMessage: obj.failure_message,
          });
          return res.status(500).json({
            success: false,
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
            },
          });
      }
    } else {
      switch (obj.billing_address) {
        case "0":
        case "2":
          await model.Payment.create({
            transactionId: obj?.tracking_id,
            bankRefNo: obj?.bank_ref_no,
            customerId: userId || null,
            orderId: obj.order_id,
            paymentStatus: successEnum[obj.order_status],
            failureMessage: obj.failure_message || obj.status_message,
            shippingCharge: shippingCost,
            amount: obj.amount,
            isLoggedIn: userId ? true : false,
            email: email,
          });

          await model.Order.update(
            {
              orderStatusId: 2,
            },
            { where: { id: Number(obj.order_id) } }
          );

          return res.json({
            success: false,
            data: {
              orderId: Number(obj.order_id),
              message: obj.failure_message || obj.order_status,
              orderType: obj.billing_address,
            },
          });

        case "1":
          await model.PlanPayment.update({
            transactionId: obj.tracking_id,
            bankRefNo: obj.bank_ref_no,
            customerId: userId || null,
            id: obj.order_id,
            paymentStatus: successEnum[obj.order_status],
            failureMessage: obj.failure_message,
          });
          return res.status(404).json({
            success: false,
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
            },
          });
      }
    }
  } catch (error) {
    loggers.error(error + "from verifyPayment function");
    return res.status(500).json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function verifyPaymentRazorPay(req, res) {
  try {
    const userId = req.user.id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // Validate request body
    const { error } = verifyPaymentValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ success: false, error: error.details });
    }

    // Fetch order from DB
    const orderRecord = await model.Order.findOne({
      where: {
        razorpayOrderId: razorpay_order_id,
        customerId: userId,
        orderStatusId: { [Op.in]: [1, 2, 4] },
      },
    });

    if (!orderRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });
    }

    // Fetch Razorpay order details
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    // Validate amount
    const amountFromRazorpay = Number((razorpayOrder.amount / 100).toFixed(2));
    if (Number(orderRecord.soldPrice) !== amountFromRazorpay) {
      return res
        .status(400)
        .json({ success: false, message: "Order amount mismatch" });
    }
    // Verify Razorpay signature
    const isSignatureValid = verifyRazorpaySignature(req.body);
    if (!isSignatureValid) {
      return res
        .status(400)
        .json({ success: false, message: "Payment signature mismatch" });
    }

    // Fetch payment details
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    if (paymentDetails.status !== "captured") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not captured" });
    }

    // Record payment in DB
    await model.Payment.create({
      transactionId: razorpay_payment_id,
      customerId: userId,
      orderId: orderRecord.id,
      paymentStatus: true,
      amount: orderRecord.soldPrice,
      isLoggedIn: true,
      email: orderRecord.email,
      paymentMethod: "Razorpay",
      encResponse: razorpay_signature,
    });

    // Update order status to 'Paid'
    await model.Order.update(
      { orderStatusId: 3 },
      { where: { id: orderRecord.id } }
    );

    if (orderRecord.promoCodeId) {
      await model.PromoCodeUsage.create({
        promoCodeId: orderRecord.promoCodeId,
        customerId: userId || null,
        email: orderRecord.email || null,
        usedAt: new Date(),
      });
    }
    // add async mail service fororder placed
    return res.json({
      success: true,
      message: "Payment verified successfully",
      order_id: orderRecord?.id,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function handlePaymentFailure(req, res) {
  try {
    const userId = req.user.id;
    const { razorpay_payment_id, razorpay_order_id, reason } = req.body;

    // Validate request body
    if (!razorpay_order_id) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    // Fetch order from DB
    const orderRecord = await model.Order.findOne({
      where: {
        razorpayOrderId: razorpay_order_id,
        customerId: userId,
        orderStatusId: { [Op.in]: [1, 2, 4] }, // Only 'Created' or 'Cancelled'
      },
    });

    if (!orderRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Record failed payment in DB
    await model.Payment.create({
      transactionId: razorpay_payment_id || null,
      customerId: userId,
      orderId: orderRecord.id,
      paymentStatus: false,
      amount: orderRecord.soldPrice,
      isLoggedIn: true,
      email: orderRecord.email,
      paymentMethod: "Razorpay",
      failureMessage: reason || "Payment failed",
      encResponse: null,
    });

    // Update order status to 'Failure'
    await model.Order.update(
      { orderStatusId: 4 }, // Failure
      { where: { id: orderRecord.id } }
    );

    return res.json({
      success: true,
      message: "Payment failure recorded successfully",
    });
  } catch (err) {
    console.error("handlePaymentFailure error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getShippingCharge(req, res) {
  const { country } = req.body;
  try {
    const shippingCost = await model.ShippingCharge.findOne({
      where: {
        country: country,
      },
    });
    const shippingCharge = shippingCost.amount;

    return res.json({
      success: true,
      message: "shipping charge",
      shippingCharge,
    });
  } catch (error) {
    loggers.error(error + "from getShippingCharge function");
    return res.json({
      success: false,
      message: "Something went wrong",
    });
  }
}

async function getDataForPaymentService(orderId, token, isEmail, isJWT) {
  try {
    let getOrderDetails;

    if (isEmail) {
      getOrderDetails = await model.Order.findOne({
        where: { id: orderId, email: token },
      });
    } else if (isJWT) {
      const customer = jwt.verify(token, config.accessSecret);
      console.log("cam in", customer);
      getOrderDetails = await model.Order.findOne({
        where: { id: orderId, customerId: customer.id },
      });
    } else {
      getOrderDetails = await model.Order.findOne({
        where: { id: orderId },
      });
    }
    if (!getOrderDetails) throw new Error("Order not found");

    if (getOrderDetails.orderStatusId === 3) {
      throw new Error("Order already completed");
    }

    let sellingPrice =
      getOrderDetails.totalPrice + getOrderDetails.shippingCharge;

    let orderObj = {
      totalPrice: Math.round(sellingPrice),
      email: getOrderDetails.customerId || getOrderDetails.email,
      shippingCost: getOrderDetails.shippingCharge,
    };

    console.log(orderObj, "Final Order Object Sent to Payment");
    return orderObj;
  } catch (error) {
    console.error("Error in getDataForPaymentService:", error);
    throw error;
  }
}

async function getDataForPlanPaymentService(obj) {
  try {
    let price = 0;
    if (obj === 0) {
      const monthlyPrice = await model.Plan.findOne({
        where: {
          planName: "bubblPro",
        },
      });

      price = monthlyPrice.monthlyPrice;
    } else {
      const yearlyPrice = await model.Plan.findOne({
        where: {
          planName: "bubblPro",
        },
      });

      price = yearlyPrice.annualPrice;
    }

    const objs = {
      totalPrice: price,
    };

    return objs;
  } catch (error) {
    throw error;
  }
}

async function productPaymentService(paymentData) {
  try {
    const payment = await model.Payment.create(paymentData);
    return payment;
  } catch (error) {
    throw error;
  }
}

export {
  initialePay,
  verifyPayment,
  getShippingCharge,
  initialePayLatest,
  initiatePayNew,
  initiatePayRazorPay,
  verifyPaymentRazorPay,
  handlePaymentFailure,
};
