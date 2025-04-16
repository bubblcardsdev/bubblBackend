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
import order from "../models/order.cjs";
import { Sequelize } from "sequelize";

async function initialePay(req, res) {
  try {
    const paymentObj = req.body;
    const orderId = paymentObj.orderId;
    console.log("orderId-------------------------------------", orderId);
    let getDataForPayment;

    if (
      Number(paymentObj.orderType) === 0 ||
      Number(paymentObj.orderType) === 1
    ) {
      getDataForPayment = await getDataForPaymentService(orderId);
    } else {
      getDataForPayment = await getDataForPlanPaymentService(
        paymentObj.planType
      );
    }
    console.log(getDataForPayment, "getDataForPayment");

    const orderType = paymentObj.orderType;
    const cost =
      getDataForPayment.shippingCost !== undefined
        ? Number(getDataForPayment.shippingCost)
        : 0;

    console.log(cost, orderType, "costsss");

    const totalAmount = getDataForPayment.totalPrice;

    const planType = paymentObj.planType === 0 ? "monthly" : "yearly";

    let token =
      orderType == 1 ? btoa(getDataForPayment?.email) : paymentObj.token;
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
    return res.status(500).json({
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
    const ccavResponse = decrypt(encData, workingKey);

    const params = new URLSearchParams(ccavResponse);
    const obj = Object.fromEntries(params.entries());

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

    obj.order_status = "Success"; //comment this before live

    const cost = obj.merchant_param2;
    const shippingCost = Number(cost);

    let sequelize = new Sequelize(process.env.DB_URL);

    const transaction = await sequelize.transaction();
    if (successEnum[obj.order_status] === true) {
      switch (obj.billing_address) {
        case "0":
          await model.Payment.create(
            {
              transactionId: obj.tracking_id,
              bankRefNo: obj.bank_ref_no,
              customerId: userId || null,
              orderId: obj.order_id,
              paymentStatus: successEnum[obj.order_status],
              failureMessage: obj.failure_message,
              shippingCharge: shippingCost,
              amount: obj.amount,
              isLoggedIn: !!userId,
            },
            { transaction: transaction }
          );

          await model.Order.update(
            {
              orderStatusId: 3,
              soldPrice: obj.amount,
            },
            {
              where: {
                id: Number(obj.order_id),
              },
              transaction: transaction,
            }
          );

          await transaction.commit();

          const checkPaymentStatus = await model.Payment.findOne({
            where: {
              orderId: Number(obj.order_id),
              paymentStatus: true,
            },
          });

          if (checkPaymentStatus) {
            const checkDeviceType = await model.OrderBreakDown.findAll({
              where: {
                orderId: Number(obj.order_id),
              },
            });

            const products = await Promise.all(
              checkDeviceType.map(async (f) => {
                const getProductDetail = await model.DeviceInventories.findOne({
                  where: { productId: f.productId },
                  include: [
                    { model: model.DeviceImageInventories },
                    { model: model.DeviceColorMasters },
                    { model: model.MaterialTypeMasters },
                    { model: model.DevicePatternMasters },
                  ],
                });

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
                      productStatus: false,
                    },
                  });

                  if (findCartItem) {
                    await model.Cart.update(
                      { productStatus: true },
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

          return res.json({
            success: true,
            message: "Payment verified successfully",
            data: {
              status: obj.order_status,
              orderId: obj.order_id,
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
    } else {
      switch (obj.billing_address) {
        case "0":
          await model.Payment.create({
            transactionId: obj?.tracking_id,
            bankRefNo: obj?.bank_ref_no,
            customerId: userId || null,
            orderId: obj.order_id,
            paymentStatus: successEnum[obj.order_status],
            failureMessage: obj.failure_message,
            shippingCharge: shippingCost,
            amount: obj.amount,
            isLoggedIn: userId ? true : false,
          });

          return res.status(404).json({
            success: false,
            orderId: Number(obj.order_id),
            message: obj.failure_message || obj.order_status,
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
    const getOrderDetails = await model.Order.findOne({
      where: { id: orderId },
    });

    if (!getOrderDetails) throw new Error("Order not found");

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

export { initialePay, verifyPayment, getShippingCharge };
