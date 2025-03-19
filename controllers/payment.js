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

async function initialePay(req, res) {
  try {
    const paymentObj = req.body;
    const orderId = paymentObj.orderId;
    console.log("orderId-------------------------------------", orderId);
    let getDataForPayment;

    if (
      Number(paymentObj.orderType) === 0 ||
      Number(paymentObj.orderType) === 2
    ) {
      getDataForPayment = await getDataForPaymentService(orderId);
    } else {
      getDataForPayment = await getDataForPlanPaymentService(
        paymentObj.planType
      );
    }
    console.log(getDataForPayment, "getDataForPayment");
    // return;

    const orderType = paymentObj.orderType;
    const cost =
      getDataForPayment.shippingCost !== undefined
        ? Number(getDataForPayment.shippingCost)
        : 0;
    console.log(cost, "cost");
    const value = getDataForPayment.totalPrice;
    // const value = val + cost;

    const planType = paymentObj.planType === 0 ? "monthly" : "yearly";
    let token =
      orderType == 2 ? btoa(getDataForPayment?.email) : paymentObj.token;
    const shippingCost = cost.toString();

    console.log(value, "value");
    console.log("token", orderType, value, orderId, planType, shippingCost);
    // return;
    //  const cost =
    //       paymentObj.shippingCost !== undefined
    //         ? Number(paymentObj.shippingCost)
    //         : 0;
    //     const val = paymentObj.value;
    //     const value = val + cost;
    //     const orderType = paymentObj.orderType;
    //     const planType = paymentObj.planType === 0 ? "monthly" : "yearly";
    //     const token = paymentObj.token;
    //     const shippingCost = cost.toString();

    //Put in the 32-Bit key shared by CCAvenues.
    const accessCode = config.paymentAccessCode; //Put in the access code shared by CCAvenues.

    let encRequest = "";
    let formbody = "";

    let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${value}&redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fcustom-api%2Fpost&cancel_url=https%3A%2F%2Fbubbl.cards%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;

    // let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${value}&redirect_url=https%3A%2F%2Fdev.bubbl.cards%2Fcustom-api%2Fpost&cancel_url=https%3A%2F%2Fdev.bubbl.cards%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;

    // let bodyData = `merchant_id=2126372&order_id=${orderId}&currency=INR&amount=${value}&redirect_url=https%3A%2F%2Fbubbl.cards%2Fcustom-api%2Fpost&cancel_url=https%3A%2F%2Fbubbl.cards%2Fcustom-api%2Fpost&language=EN&billing_name=${planType}&billing_address=${orderType}&merchant_param1=${token}&merchant_param2=${shippingCost}&billing_city=Chennai&billing_state=MH&billing_zip=400054&billing_country=India&billing_tel=9876543210&billing_email=testing%40domain.com&integration_type=iframe_normal&promo_code=&customer_identifier=`;
    encRequest = encrypt(bodyData, workingKey);
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

    // Configure Nodemailer
    // const transporter = nodemailer.createTransport({
    //   host: config.sesSmtpHost,
    //   port: config.sesSmtpPort,
    //   secure: false,
    //   auth: {
    //     user: config.sesSmtpUsername,
    //     pass: config.sesSmtpPassword,
    //   },
    // });

    // const mailOptions = {
    //   from: config.smtpFromEmail,
    //   to: [
    //     "shunmugapriya@rvmatrix.in",
    //     "kiran@rvmatrix.in",
    //     "sai.darshan@rvmatrix.in",
    //     "sahilreddy21@gmail.com",
    //   ],
    //   subject: "HTML content for plan payment",
    //   text: formbody,
    // };

    // await transporter.sendMail(mailOptions);

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
    return res.json({
      success: false,
      data: {
        message: error,
      },
    });
  }
}

const successEnum = {
  Success: true,
  Failure: false,
};

async function verifyPayment(req, res) {
  try {
    const encData = req.body.data;
    console.log(encData);
    
    //check if it has encrypted data or validate
    const ccavResponse = decrypt(encData, workingKey);
    

    const params = new URLSearchParams(ccavResponse);
    const obj = Object.fromEntries(params.entries());
    const token = atob(obj.merchant_param1);
    let userId = 0;
    
    if (obj?.billing_address != "2") {
      try { 
        const tokenData = jwt.verify(token, config.accessSecret);
        userId = tokenData.id;
      } catch (e) {
        console.log(e);
        // console.log("failed to verify token");
      }
    }
    userId = userId === 0? null: userId;

    obj.order_status= "Success";//comment this before live
    
    const cost = obj.merchant_param2;
    const shippingCost = Number(cost);
    const getOrderDetails = await model.Order.findOne({
      where: {
        id: Number(obj.order_id),
      },
    });

    if (successEnum[obj.order_status] === true) {
      // const cost = obj.merchant_param2;
      // const shippingCost = Number(cost);
      // create entry in db with obj.tracking_id and obj.bank_ref_no against orderId
      switch (obj.billing_address) {
        case "0":
          await model.Payment.update(
            {
              transactionId: obj.tracking_id,
              bankRefNo: obj.bank_ref_no,
              customerId: userId || null,
              paymentStatus: successEnum[obj.order_status],
              failureMessage: obj.failure_message,
              shippingCharge: shippingCost,
              email:getOrderDetails.email,
              totalPrice: getOrderDetails.totalPrice,
              discountAmount: getOrderDetails.discountAmount,
              discountPercentage: getOrderDetails.discountPercentage,
              soldPrice:obj.amount,
              amount:obj.amount,
              isLoggedIn:userId ? true : false
            },
            {
              where: {
                orderId: Number(obj.order_id),
              },
            }
          );
          await model.Order.update(
            {
              orderStatus: "Paid",
              orderStatusId: 3,
              soldPrice:obj.amount
            },
            {
              where: {
                id: Number(obj.order_id),
              },
            }
          );
          // if the payment is successful, email send to user
          const checkPaymentStatus = await model.Payment.findOne({
            where: {
              orderId: obj.order_id,
              paymentStatus: true,
            },
          });
          if (checkPaymentStatus) {
            const checkDeviceType = await model.OrderBreakDown.findAll({
              where: {
                orderId: obj.order_id,
              },
            });

            const products = await Promise.all(
              await checkDeviceType.map(async (f) => {
                const getProductDetail = await model.DeviceInventories.findOne({
                  where: {
                    productId: f.productId,
                  },
                  include: [
                    {
                      model: model.DeviceImageInventories,
                    },
                    {
                      model: model.DeviceColorMasters,
                    },
                    {
                      model: model.MaterialTypeMasters,
                    },
                    {
                      model: model.DevicePatternMasters,
                    },
                  ],
                });
                const imageUrls = await Promise.all(
                  (getProductDetail.DeviceImageInventories || []).map(
                    async (img) => await generateSignedUrl(img.imageKey)
                  )
                );
                const getFontName = await model.CustomFontMaster.findOne({
                  where: { id: f.fontId },
                });   
               if(userId){
                const findCartItem= await model.Cart.findOne({
                  where:{
                    productUUId: f.productId,
                    customerId:userId,
                    productStatus: false
                  }
                });
                await model.Cart.update({
                  productStatus: true
                },{
                  where:{
                    id:findCartItem.id,
                    customerId:userId,
                  }
                });
               }
                
                return {
                  productId: f.productId,
                  productPrimaryImage: imageUrls[0],
                  productSecondaryImage: imageUrls[1],
                  deviceType: getProductDetail.deviceTypeId,
                  font: getFontName?.name || null,
                  customName: f.nameOnCard || null,
                  productName: getProductDetail.name,
                  productPrice:getProductDetail.price,
                  quantity: f.quantity
                };
              })
            );  
            console.log(products);
            
            const nameCustomProducts = products.filter(
              (product) => product.deviceType === 6
            );

            const otherProducts = products.filter(
              (product) => product.deviceType !== 6
            );
            // console.log(nameCustomProducts,otherProducts);
            
            if (nameCustomProducts.length > 0) {
              NameCustomEmail(nameCustomProducts, obj.order_id);
            } 
            if(otherProducts.length > 0) {
              console.log("came in else");
              OrderConfirmationMail(otherProducts, obj.order_id, userId);
            }
          }

          return res.json({
            success: true,
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
              paymentMode: obj.payment_mode,
              orderType: obj.billing_address,
              jwtToken: token,
              shippingCharge: shippingCost,
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
          // comment the below logic if not needed.
        case "2":
          await model.Payment.update(
            {
              transactionId: obj.tracking_id,
              bankRefNo: obj.bank_ref_no,
              customerId: userId || null,
              paymentStatus: successEnum[obj.order_status],
              failureMessage: obj.failure_message,
              shippingCharge: shippingCost,
              email:getOrderDetails.email,
              totalPrice: getOrderDetails.totalPrice,
              discountAmount: getOrderDetails.discountAmount,
              discountPercentage: getOrderDetails.discountPercentage,
              soldPrice:obj.amount,
              paidAmount: obj.amount,
              isLoggedIn:userId? true: false
            },
            {
              where: {
                orderId: Number(obj.order_id),
              },
            }
          );
          await model.Order.update(
            {
              orderStatus: "Paid",
              orderStatusId: 3,
              soldPrice:obj.amount
            },
            {
              where: {
                id: Number(obj.order_id),
              },
            }
          );
          // if the payment is successful, email send to user
          const checkPaymentStat = await model.Payment.findOne({
            where: {
              orderId: obj.order_id,
              paymentStatus: true,
            },
          });
          if (checkPaymentStat) {
            const checkDeviceType = await model.OrderBreakDown.findAll({
              where: {
                orderId: obj.order_id,
              },
            });

            const products = await Promise.all(
              await checkDeviceType.map(async (f) => {
                const getProductDetail = await model.DeviceInventories.findOne({
                  where: {
                    productId: f.productId,
                  },
                  include: [
                    {
                      model: model.DeviceImageInventories,
                    },
                    {
                      model: model.DeviceColorMasters,
                    },
                    {
                      model: model.MaterialTypeMasters,
                    },
                    {
                      model: model.DevicePatternMasters,
                    },
                  ],
                });
                const imageUrls = await Promise.all(
                  (getProductDetail.DeviceImageInventories || []).map(
                    async (img) => await generateSignedUrl(img.imageKey)
                  )
                );
                const getFontName = await model.CustomFontMaster.findOne({
                  where: { id: f.fontId },
                });   
               if(userId){
                const findCartItem= await model.Cart.findOne({
                  where:{
                    productUUId: f.productId,
                    customerId:userId,
                    productStatus: false
                  }
                });
                await model.Cart.update({
                  productStatus: false
                },{
                  where:{
                    id:findCartItem.id,
                    customerId:userId,
                  }
                });
               }
                
                return {
                  productId: f.productId,
                  productPrimaryImage: imageUrls[0],
                  productSecondaryImage: imageUrls[1],
                  deviceType: getProductDetail.deviceTypeId,
                  font: getFontName?.name || null,
                  customName: f.nameOnCard || null,
                  productName: getProductDetail.name,
                  productPrice:getProductDetail.price,
                  quantity: f.quantity
                };
              })
            );  
            console.log(products);
            
            const nameCustomProducts = products.filter(
              (product) => product.deviceType === 6
            );

            const otherProducts = products.filter(
              (product) => product.deviceType !== 6
            );
            // console.log(nameCustomProducts,otherProducts);
            
            if (nameCustomProducts.length > 0) {
              NameCustomEmail(nameCustomProducts, obj.order_id);
            } 
            if(otherProducts.length > 0) {
              console.log("came in else");
              OrderConfirmationMail(otherProducts, obj.order_id, userId);
            }
          }

          return res.json({
            success: true,
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
              paymentMode: obj.payment_mode,
              orderType: obj.billing_address,
              jwtToken: token,
              shippingCharge: shippingCost,
            },
          });
      }
    } else {
      switch (obj.billing_address) {
        case "0":
          await model.Payment.update({
            transactionId: obj.tracking_id,
            bankRefNo: obj.bank_ref_no,
            customerId: userId || null,
            orderId: obj.order_id,
            paymentStatus: successEnum[obj.order_status],
            failureMessage: obj.failure_message,
            shippingCharge: shippingCost,
            totalPrice: getOrderDetails.totalPrice,
            discountAmount: getOrderDetails.discountAmount,
            discountPercentage: getOrderDetails.discountPercentage,
            paidAmount: null,
            isLoggedIn: userId? true : false,
            email:getOrderDetails.email
          });
          // create entry in db with obj.tracking_id, obj.bank_ref_no, obj.failure_message
          return res.json({
            success: false,
            orderType: obj.billing_address,
            message: obj.failure_message,
          });

        case "1":
          await model.PlanPayment.update({
            transactionId: obj.tracking_id,
            bankRefNo: obj.bank_ref_no,
            // customerId: userId,
            id: obj.order_id,
            paymentStatus: successEnum[obj.order_status],
            failureMessage: obj.failure_message,
          });
          return res.json({
            success: false,
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
              orderType: obj.billing_address,
              paymentMode: obj.payment_mode,
            },
          });
          case "2":
            await model.Payment.update({
              transactionId: obj.tracking_id,
              bankRefNo: obj.bank_ref_no,
              customerId: userId || null,
              orderId: obj.order_id,
              paymentStatus: successEnum[obj.order_status],
              failureMessage: obj.failure_message,
              shippingCharge: shippingCost,
              totalPrice: getOrderDetails.totalPrice,
              discountAmount: getOrderDetails.discountAmount,
              discountPercentage: getOrderDetails.discountPercentage,
              paidAmount: null,
              isLoggedIn: userId? true : false,
              email:getOrderDetails.email
            });
            // create entry in db with obj.tracking_id, obj.bank_ref_no, obj.failure_message
            return res.json({
              success: false,
              orderType: obj.billing_address,
              message: obj.failure_message,
            });
   }
    }
  } catch (error) {
    loggers.error(error + "from verifyPayment function");
    return res.json({
      success: false,
      data: {
        message: error,
      },
    });
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

async function getDataForPaymentService(orderId) {
  try {
    console.log(orderId, "orderId");

    const getOrderDetails = await model.Order.findOne({
      where: { id: orderId },
    });
    if (!getOrderDetails) throw new Error("Order not found");

    // const cartItems = await model.Cart.findAll({ where: { orderId } });
    // if (!cartItems || cartItems.length === 0)
    //   throw new Error("CartItems not found");

    //#region - Discount logic

    // Discount Logic
    // const discountedTypes = ["Card", "Socket", "Tile", "Bundle Devices"];
    // const cartData = cartItems.map((item) => item.dataValues);

    // const discountEligibleItems = cartData.filter(
    //   (item) =>
    //     item.productType !== "Full Custom" &&
    //     item.productType !== "NC-Pattern" &&
    //     discountedTypes.includes(item.productType)
    // );

    // const nondiscountEligibleItems = cartData.filter(
    //   (item) => !discountEligibleItems.some((d) => d.id === item.id)
    // );

    // // Calculate total quantity of discount-eligible items
    // const totalQuantity = discountEligibleItems.reduce(
    //   (sum, item) => sum + item.quantity,
    //   0
    // );

    // // console.log(totalQuantity, "totalQuantity");

    // let totalDiscountPrice = discountEligibleItems.reduce(
    //   (sum, item) => sum + item.productPrice,
    //   0
    // );

    // let totalNonDiscountPrice = nondiscountEligibleItems.reduce(
    //   (sum, item) => sum + item.productPrice,
    //   0
    // );

    // console.log(totalDiscountPrice, totalNonDiscountPrice, "totalPrice");
    // let discountAmount = 0;
    // let discountedTotal = 0;
    // let appliedDiscountRate = 0;

    // // Determine correct discount rate
    // let discountRate = 0.4;
    // if (totalQuantity === 1) discountRate = 0.6; // 40%
    // else if (totalQuantity === 2) discountRate = 0.5; //50%
    // else if (totalQuantity >= 3) discountRate = 0.4; //60%

    // // console.log(discountRate * totalDiscountPrice);
    // // console.log(discountRate * totalDiscountPrice + totalNonDiscountPrice);

    // const afterDiscountPrice = Math.round(discountRate * totalDiscountPrice);

    // // Standardize final prices
    // let totalPrice = afterDiscountPrice + totalNonDiscountPrice;
    // // eslint-disable-next-line no-unused-vars
    // discountedTotal = Math.round(discountedTotal);
    // discountAmount = Math.round((1 - discountRate) * totalDiscountPrice);

    // await model.Order.update(
    //   {
    //     discountPercentage: (1 - discountRate) * 100,
    //     discountAmount: Math.round(discountAmount),
    //     soldPrice: Math.round(totalPrice),
    //   },
    //   { where: { id: orderId } }
    // );

    //#endregion

    const shipping = await model.Shipping.findOne({ where: { orderId } });
    if (!shipping)
      throw new Error("No shipping record found for orderId:", orderId);

    const shippingCountry = shipping?.country || "default";
    const shipCost = await model.ShippingCharge.findOne({
      where: { country: shippingCountry.toLowerCase() },
    });

    // let
    // console.log(getOrderDetails, "ll");
    let sellingPrice = getOrderDetails.totalPrice + shipCost.amount;
    // return;

    const updateOrder = await model.Order.update(
      {
        soldPrice: Number(sellingPrice),
        shippingCharge: Number(shipCost.amount),
      },
      {
        where: {
          id: orderId,
        },
      }
    );

    if (!updateOrder) {
      throw new Error("Cannot update order");
    }

    const createPayment = await model.Payment.create({
      orderId: orderId,
      customerId: getOrderDetails.customerId || null,
      paymentStatus: false,
      failureMessage: "",
    });

    if (!createPayment) {
      throw new Error("Cannot create payment entry");
    }

    let orderObj = {
      totalPrice: Math.round(sellingPrice),
      email: getOrderDetails.customerId || getOrderDetails.email,
      shippingCost: shipCost.amount,
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

export { initialePay, verifyPayment, getShippingCharge };
