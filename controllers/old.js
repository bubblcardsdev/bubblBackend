async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { productId, fontId, customName, quantity } = req.body;

    const { error } = addToCartSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.json({
        success: false,
        data: {
          error: error.details,
        },
      });
    }

    console.log("Success", cartItem);

    const checkOrder = await model.Order.findOne({
      attributes: { exclude: ["ShippingId", "PaymentId"] },
      where: {
        customerId: userId,
        orderStatus: "cart",
      },
      include: {
        model: model.Cart,
      },
    });

    if (checkOrder === null) {
      await model.Order.create({
        customerId: userId,
        totalPrice: cartItem.productPrice,
        orderStatus: "cart",
      });
    }

    let getOrder = await model.Order.findOne({
      where: {
        customerId: userId,
        orderStatus: "cart",
      },
    });

    const checkCart = await model.Cart.findOne({
      where: {
        orderId: getOrder.id,
        productType: cartItem.productType,
        productColor: cartItem.productColor,
      },
    });
    let getProduct = await model.DeviceInventory.findOne({
      where: {
        deviceType: cartItem.productType,
        deviceColor: cartItem.productColor,
      },
    });

    let productCost = getProduct.price * cartItem.quantity;
    if (checkCart === null) {
      await model.Cart.create({
        productType: cartItem.productType,
        customerId: userId,
        orderId: getOrder.id,
        quantity: cartItem.quantity,
        productColor: cartItem.productColor,
        productPrice: productCost,
        productStatus: cartItem.productStatus,
      });
    } else {
      let quantity = checkCart.quantity;
      let productPrice = checkCart.productPrice;
      if (checkCart.productStatus) {
        quantity += cartItem.quantity;
        productPrice += getProduct.productPrice;

        await model.Cart.update(
          {
            quantity: cartItem.quantity,
            productPrice: productCost,
          },
          {
            where: {
              id: checkCart.id,
            },
          }
        );
      } else {
        await model.Cart.update(
          {
            quantity: cartItem.quantity,
            productPrice: productCost,
            productStatus: true,
          },
          {
            where: {
              id: checkCart.id,
            },
          }
        );
      }
    }

    const getCartPrice = await model.Cart.sum("productPrice", {
      where: { orderId: getOrder.id, productStatus: true },
    });

    await model.Order.update(
      { totalPrice: getCartPrice },
      { where: { customerId: userId, orderStatus: "cart" } }
    );

    return res.json({
      success: true,
      data: {
        message: "Cart Updated successfully",
      },
    });
  } catch (error) {
    console.log(error);
    logger.error(error, "from addToCart function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function cancelCart(req, res) {
  const userId = req.user.id;
  const { orderId, cartId } = req.body;

  try {
    const checkOrder = await model.Order.findOne({
      where: {
        id: orderId,
      },
    });

    if (checkOrder) {
      const orderStatus = checkOrder.orderStatus;

      if (orderStatus === "cart") {
        const updateCartItem = await model.Cart.update(
          {
            productStatus: false,
          },
          {
            where: {
              id: cartId,
              customerId: userId,
            },
          }
        );
        return res.json({
          success: true,
          message: "Order Cancelled",
          updateCartItem,
        });
      } else {
        return res.json({
          success: false,
          message: "Order CheckOut",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }
  } catch (error) {
    logger.error(error + "from cancelCart function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function addToNonUserCart(req, res) {
  try {
    const { cartData, email } = req.body;

    if (isEmpty(cartData) || !email) {
      return res.json({
        success: false,
        message: "Invalid Data",
      });
    }

    const updateTotalByProduct = await Promise.all(
      cartData.map(async (item) => {
        if (item?.productType?.includes("NC-")) {
          const checkNc = await model.NameDeviceImageInventory.findOne({
            where: {
              id: item?.deviceInventorId,
            },
          });
          item["totalPrice"] = checkNc.price * item?.quantity;
          item["productPrice"] = checkNc.price;
        } else {
          const checkOthers = await model.DeviceInventory.findOne({
            where: {
              deviceType: item?.productType,
              deviceColor: item?.productColor,
            },
          });
          item["totalPrice"] = checkOthers.price * item?.quantity;
          item["productPrice"] = checkOthers.price;
        }
        return item;
      })
    );

    const totalPrice = sumBy(updateTotalByProduct, "totalPrice", 0);

    await model.Order.update(
      {
        orderStatus: "cancelled",
      },
      {
        where: {
          email: email,
          orderStatus: "cart",
        },
      }
    );

    const getOrder = await model.Order.create({
      email: email,
      totalPrice: totalPrice,
      orderStatus: "cart",
    });

    console.log(getOrder?.id || getOrder?.dataValues?.id, "getOrder");
    const order_id = getOrder?.id || getOrder?.dataValues?.id;

    // insert all items into cart

    const cartItems = cartData.map((item) => {
      console.log("Addding to cart", item);
      return {
        orderId: getOrder?.id,
        productColor: item?.productColor,
        productType: item?.productType,
        productPrice: item?.productPrice,
        productStatus: 1,
        quantity: item?.quantity,
        email,
      };
    });
    await model.Cart.bulkCreate(cartItems);
    console.log("Addded to cart");
    //insert name custom info
    const nameCustom = cartData.filter((item) =>
      item?.productType.includes("NC-")
    );
    console.log(nameCustom, "name CustomData");
    if (!isEmpty(nameCustom)) {
      console.log("Addding to namecustom data");
      const namCustomItems = nameCustom.map((item) => {
        const filePath = "./services/pdf/review.pdf";
        uploadFileToS3(res, null, filePath, email);
        return {
          customName: item?.name,
          quantity: item?.quantity,
          fontStyle: item?.fontStyle,
          productType: item?.productType,
          productPrice: item?.productPrice,
          productColor: item?.productColor,
          email,
          orderId: order_id,
          productStatus: item?.productStatus,
          deviceInventorId: item?.deviceInventorId,
        };
      });
      await model.CustomCards.bulkCreate(namCustomItems);
      console.log("Name custom Data added");
    }

    const fullCustom = cartData.filter((item) =>
      item?.productType.includes("Full Custom")
    );
    console.log(fullCustom, "fullcustom data");
    if (!isEmpty(fullCustom)) {
      console.log("Addding to full custom data");
      const fullCustomItems = fullCustom.map((item) => {
        return {
          quantity: item?.quantity,
          productPrice: item?.productPrice,
          email,
          orderId: order_id,
          productStatus: false,
        };
      });
      await model.FullyCustom.bulkCreate(fullCustomItems);
      console.log("Full custom data added");
    }

    return res.json({
      success: false,
      message: "Cart Updated Successfully",
    });
  } catch (error) {
    console.log("Add to cart======", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function checkOut(req, res) {
  const userId = req.user.id;
  const {
    orderId,
    firstName,
    lastName,
    phoneNumber,
    emailId,
    flatNumber,
    address,
    city,
    state,
    zipcode,
    country,
    landmark,
    isShipped,
  } = req.body;

  const { error } = shippingDetails.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    const order = await model.Order.findOne({
      where: {
        id: orderId,
        customerId: userId,
      },
    });
    if (order) {
      const checkExisitingDetail = await model.Shipping.findOne({
        where: {
          orderId,
        },
      });
      if (checkExisitingDetail) {
        const updateShippingDetails = await model.Shipping.update(
          {
            firstName,
            lastName,
            phoneNumber,
            emailId,
            flatNumber,
            address,
            city,
            state,
            zipcode,
            country,
            landmark,
            isShipped,
          },
          {
            where: {
              orderId,
            },
          }
        );
        return res.json({
          success: true,
          message: "Shipping details updated",
          updateShippingDetails,
        });
      } else {
        const createShippingDetails = await model.Shipping.create({
          orderId: order.id,
          firstName,
          lastName,
          phoneNumber,
          emailId,
          flatNumber,
          address,
          city,
          state,
          zipcode,
          country,
          landmark,
          isShipped,
        });

        const createPayment = await model.Payment.create({
          orderId: orderId,
          customerId: userId,
          paymentStatus: false,
          failureMessage: "",
        });

        return res.json({
          success: true,
          message: "Created",
          createShippingDetails,
          createPayment,
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }
  } catch (error) {
    console.log(error);
    loggers.error(error + "from checkOut function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function addToNonUserCart(req, res) {
  try {
    const { cartData, email } = req.body;

    if (isEmpty(cartData) || !email) {
      return res.json({
        success: false,
        message: "Invalid Data",
      });
    }

    const updateTotalByProduct = await Promise.all(
      cartData.map(async (item) => {
        if (item?.productType?.includes("NC-")) {
          const checkNc = await model.NameDeviceImageInventory.findOne({
            where: {
              id: item?.deviceInventorId,
            },
          });
          item["totalPrice"] = checkNc.price * item?.quantity;
          item["productPrice"] = checkNc.price;
        } else {
          const checkOthers = await model.DeviceInventory.findOne({
            where: {
              deviceType: item?.productType,
              deviceColor: item?.productColor,
            },
          });
          item["totalPrice"] = checkOthers.price * item?.quantity;
          item["productPrice"] = checkOthers.price;
        }
        return item;
      })
    );

    const totalPrice = sumBy(updateTotalByProduct, "totalPrice", 0);

    await model.Order.update(
      {
        orderStatus: "cancelled",
      },
      {
        where: {
          email: email,
          orderStatus: "cart",
        },
      }
    );

    const getOrder = await model.Order.create({
      email: email,
      totalPrice: totalPrice,
      orderStatus: "cart",
    });

    console.log(getOrder?.id || getOrder?.dataValues?.id, "getOrder");
    const order_id = getOrder?.id || getOrder?.dataValues?.id;

    // insert all items into cart

    const cartItems = cartData.map((item) => {
      console.log("Addding to cart", item);
      return {
        orderId: getOrder?.id,
        productColor: item?.productColor,
        productType: item?.productType,
        productPrice: item?.productPrice,
        productStatus: 1,
        quantity: item?.quantity,
        email,
      };
    });
    await model.Cart.bulkCreate(cartItems);
    console.log("Addded to cart");
    //insert name custom info
    const nameCustom = cartData.filter((item) =>
      item?.productType.includes("NC-")
    );
    console.log(nameCustom, "name CustomData");
    if (!isEmpty(nameCustom)) {
      console.log("Addding to namecustom data");
      const namCustomItems = nameCustom.map((item) => {
        const filePath = "./services/pdf/review.pdf";
        uploadFileToS3(res, null, filePath, email);
        return {
          customName: item?.name,
          quantity: item?.quantity,
          fontStyle: item?.fontStyle,
          productType: item?.productType,
          productPrice: item?.productPrice,
          productColor: item?.productColor,
          email,
          orderId: order_id,
          productStatus: item?.productStatus,
          deviceInventorId: item?.deviceInventorId,
        };
      });
      await model.CustomCards.bulkCreate(namCustomItems);
      console.log("Name custom Data added");
    }

    const fullCustom = cartData.filter((item) =>
      item?.productType.includes("Full Custom")
    );
    console.log(fullCustom, "fullcustom data");
    if (!isEmpty(fullCustom)) {
      console.log("Addding to full custom data");
      const fullCustomItems = fullCustom.map((item) => {
        return {
          quantity: item?.quantity,
          productPrice: item?.productPrice,
          email,
          orderId: order_id,
          productStatus: false,
        };
      });
      await model.FullyCustom.bulkCreate(fullCustomItems);
      console.log("Full custom data added");
    }

    return res.json({
      success: false,
      message: "Cart Updated Successfully",
    });
  } catch (error) {
    console.log("Add to cart======", error);
    return res.json({
      success: false,
      message: error.message,
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

    const cartItems = await model.Cart.findAll({ where: { orderId } });
    if (!cartItems || cartItems.length === 0)
      throw new Error("CartItems not found");

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

    const totalQuantity = cartItems.reduce(
      (accumulator, item) => accumulator + item.quantity,
      0
    );

    let totalPrice = getOrderDetails.totalPrice;
    console.log(totalPrice, totalQuantity, "tamil");

    const updateOrder = await model.Order.update(
      {
        totalPrice: totalPrice,
        soldPrice: totalPrice,
      },
      {
        where: {
          id: orderId,
        },
      }
    );

    const shipping = await model.Shipping.findOne({ where: { orderId } });
    if (!shipping)
      throw new Error("No shipping record found for orderId:", orderId);

    const shippingCountry = shipping?.country || "default";
    const shipCost = await model.ShippingCharge.findOne({
      where: { country: shippingCountry.toLowerCase() },
    });

    let cost = shipCost ? shipCost.amount : "500"; // Default shipping cost if not found

    let orderObj = {
      totalPrice: Math.round(totalPrice),
      email: getOrderDetails.customerId || getOrderDetails.email,
      quantity: totalQuantity,
      shippingCost: cost,
    };

    console.log(orderObj, "Final Order Object Sent to Payment");
    return orderObj;
  } catch (error) {
    console.error("Error in getDataForPaymentService:", error);
    throw error;
  }
}

async function getOrderById(req, res) {
  const { orderId } = req.body;
  try {
    const order = await model.Order.findAll({
      where: {
        id: orderId,
        // customerId: userId,
        cancelledOrder: false,
      },
      include: [
        {
          model: model.Cart,
          where: {
            productStatus: true,
          },
        },
        {
          model: model.Shipping,
        },
        {
          model: model.Payment,
        },
      ],
    });

    // func for getting the images for corresponding orders
    let deviceImages = [];
    let deviceInventory = "";

    deviceImages = await Promise.all(
      order[0].Carts.map(async (cartVal) => {
        if (cartVal.productType.includes("NC-")) {
          const getImageId = await model.NameDeviceImageInventory.findOne({
            where: {
              deviceType: cartVal.productType,
              deviceColor: cartVal.productColor,
            },
          });
          if (getImageId) {
            const deviceInventory = await model.NameCustomImages.findOne({
              where: {
                NameCustomDeviceId: getImageId.id,
                cardView: false,
              },
            });

            const itemImg = await generateSignedUrl(deviceInventory.imageUrl);

            return itemImg;
          }
        } else {
          deviceInventory = await model.DeviceInventory.findOne({
            where: {
              deviceType: cartVal.productType,
              deviceColor: cartVal.productColor,
            },
          });

          const itemImg = await generateSignedUrl(deviceInventory.deviceImage);
          return itemImg;
        }
      })
    );

    const displayNames = await Promise.all(
      order[0].Carts.map(async (cartVal) => {
        if (cartVal.productType.includes("NC-")) {
          const deviceName = await model.NameDeviceImageInventory.findOne({
            where: {
              deviceType: cartVal.productType,
              deviceColor: cartVal.productColor,
            },
          });
          if (deviceName) {
            return deviceName.displayName;
          }
        } else {
          return cartVal.productType;
        }
      })
    );

    return res.json({
      success: true,
      message: "Order Details",
      order,
      deviceImages,
      displayNames,
    });
  } catch (error) {
    console.error(error + "from getOrderById function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function OrderConfirmationMail(
  getCustomName,
  orderId,
  userId,
  email = ""
) {
  try {
    let orderMailContent = "";
    const whereClause = email
      ? {
          id: orderId,
          email,
          cancelledOrder: false,
        }
      : {
          id: orderId,
          customerId: userId,
          cancelledOrder: false,
        };
    const order = await model.Order.findAll({
      where: whereClause,
      include: [
        {
          model: model.Cart,
          where: {
            productStatus: true,
          },
        },
        {
          model: model.Shipping,
        },
        {
          model: model.Payment,
        },
      ],
    });

    const filterOrder = order[0].Carts.filter((val) =>
      val.productType.includes("NC-")
    );

    // func for getting the images for corresponding orders
    let deviceImages = [];
    let deviceInventory = "";

    deviceImages = await Promise.all(
      order[0].Carts.map(async (cartVal) => {
        if (cartVal.productType.includes("NC-")) {
          const getImageId = await model.NameDeviceImageInventory.findOne({
            where: {
              deviceType: cartVal.productType,
              deviceColor: cartVal.productColor,
            },
          });
          if (getImageId) {
            const deviceInventory = await model.NameCustomImages.findOne({
              where: {
                NameCustomDeviceId: getImageId.id,
                cardView: false,
              },
            });

            const itemImg = await generateSignedUrl(deviceInventory.imageUrl);

            return itemImg;
          }
        } else {
          deviceInventory = await model.DeviceInventory.findOne({
            where: {
              deviceType: cartVal.productType,
              deviceColor: cartVal.productColor,
            },
          });

          const itemImg = await generateSignedUrl(deviceInventory.deviceImage);
          return itemImg;
        }
      })
    );

    if (filterOrder.length === 0) {
      orderMailContent = `
    <html>
          <head>
            <title>HTML Image Wrapper</title>
            <style>
          
            .order_details_head {
              font-family: "Oxygen";
              font-weight: 700;
              font-size: 24px;
            }
         
            .details_p {
              font-family: "Oxygen";
              font-weight: 400;
              font-size: 14px;
              opacity: 0.6;
            }
            .details_h {
              font-family: "Oxygen";
              font-weight: 400;
              font-size: 16px;
              padding-left: 15px;
            }
            .details_span {
              opacity: 0.6;
            }
         
            </style>
        
          </head>
          <body>
          <div>
          <p>Dear Customer,</p>
          <p>Thank you for placing an order with Bubbl.cards! Your order #${orderId} has been confirmed and is now being processed.</p>
          <p>We will keep you updated on the status of your order and notify you as soon as it's shipped. If you have any questions or concerns, please don't hesitate to contact us at ${7845861552}.</p>
          <p>Thank you for choosing Bubbl.cards, and we hope you enjoy your purchase!</p>
          ${order[0].Carts.map(
            (val, index) => `
            <table>
            <tr>
            <td class="qr">
              <img src=${deviceImages[index]} alt="Card Img" width="100" height="100"/>
            </td>
            <td class="order_details" style="padding-left: 20px">
              <h2 class="order_details_head">BUBBL <br/> ${val.productType}</h2>
              <p class="details_p">QTY: ${val.quantity} | Rs.${val.productPrice}</p>
            </td>
          </tr>
          </table>
        
  `
          ).join("")}
          <p>Best regards,</p>
          <p>The Bubbl.cards team.</p>
          <p>Customer Care Number:${7845861552}</p>
          </div>
      
         
            
          </body>
          </html>`;
      //   });

      // Configure Nodemailer
      const transporter = nodemailer.createTransport({
        host: config.sesSmtpHost,
        port: config.sesSmtpPort,
        secure: false,
        auth: {
          user: config.sesSmtpUsername,
          pass: config.sesSmtpPassword,
        },
      });

      const getUserMailId = await model.Shipping.findOne({
        where: {
          orderId: orderId,
        },
      });
      const mailOptions = {
        from: config.smtpFromEmail,
        to: getUserMailId.emailId,
        // to: "shunmugapriya@rvmatrix.in",
        subject: `Bubbl order Confirmation, Order no: #${orderId}`,
        html: orderMailContent,
      };

      await transporter.sendMail(mailOptions);
    } else {
      orderMailContent = `
    <html>
          <head>
            <title>HTML Image Wrapper</title>
            <style>
          
            .order_details_head {
              font-family: "Oxygen";
              font-weight: 700;
              font-size: 24px;
            }
         
            .details_p {
              font-family: "Oxygen";
              font-weight: 400;
              font-size: 14px;
              opacity: 0.6;
            }
            .details_h {
              font-family: "Oxygen";
              font-weight: 400;
              font-size: 16px;
              padding-left: 15px;
            }
            .details_span {
              opacity: 0.6;
            }
         
            </style>
        
          </head>
          <body>
          <div>
          <p>Dear Customer,</p>
          <p>Thank you for placing an order with Bubbl.cards! Your order #${orderId} has been confirmed and is now being processed.</p>
          <p>We will keep you updated on the status of your order and notify you as soon as it's shipped. If you have any questions or concerns, please don't hesitate to contact us at ${7845861552}.</p>
          <p>Thank you for choosing Bubbl.cards, and we hope you enjoy your purchase!</p>
          ${order[0].Carts.map(
            (val, index) => `
            <table>
            <tr>
            <td class="qr">
              <img src=${deviceImages[index]} alt="Card Img" width="100" height="100"/>
            </td>
            <td class="order_details">
              <h2 class="order_details_head">BUBBL <br/> ${val.productType}</h2>
              <p class="details_p">QTY: ${val.quantity} | Rs.${val.productPrice}</p>
            </td>
          </tr>
          </table>
        
  `
          ).join("")}
          <p>Best regards,</p>
          <p>The Bubbl.cards team.</p>
          <p>Customer Care Number:${7845861552}</p>
          </div>
      
         
            
          </body>
          </html>`;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const rqColor = "#0000FF";

      const uuid = uuidv4(); // Generate a new UUID
      const data = `https://bubbl.cards/profile/${uuid}`; // Use the UUID in the QR code data

      await model.Device.create({
        deviceUid: uuid,
        deviceType: "Card",
      });

      const options = {
        errorCorrectionLevel: "H",
        type: "image/jpeg",
        quality: 0.92,
        margin: 1,
        color: {
          dark: rqColor, // Set the color for the dark modules (red)
          light: "#FFFFFF", // Set the color for the light modules (white)
        },
      };

      let combinedHTMLContent = `
    <html>
    <head>
    <style>
      @font-face {
        font-family: "amenti";
        src: url("http://localhost:8000/fonts/AmentiBold.woff2") format("woff2");
      }
      @font-face {
        font-family: "muller";
        src: url("http://localhost:8000/fonts/Muller-ExtraBold.woff2") format("woff2");
      }
      @font-face {
        font-family: "romeliosans";
        src: url("http://localhost:8000/fonts/Romeliosans-z8y7L.woff2") format("woff2");
      }
    </style>
    </head>
    <body>
  `;
      await qr.toDataURL(data, options);
      await Promise.all(
        getCustomName.map(async (card, index) => {
          let getCardTypeDevice = await model.NameDeviceImageInventory.findAll({
            where: {
              id: card.deviceInventorId,
            },
            include: [
              {
                model: model.NameCustomImages,
              },
            ],
          });

          let frontImg = "";
          let backImg = "";
          const fontColor = getCardTypeDevice[0].fontColor;

          await Promise.all(
            getCardTypeDevice[0].NameCustomImages.map(async (device) => {
              if (device.cardView) {
                frontImg = await generateSignedUrl(device.printImgUrl);
                // frontImg = encodeURI(frontImg);
              } else {
                backImg = await generateSignedUrl(device.printImgUrl);
              }
            })
          );

          combinedHTMLContent += `
  <!-- Back View -->

<div>  
  <img
    src=${frontImg}
    width="443px"
    height="279px"
    style="position: absolute"
  />
  <div>
    <p
      style="
        font-size: 22px;
        font-family:${card.fontStyle};
        padding-left: 20px;
        color:${fontColor};
        position: relative;
        top: 235px;
      "
    >
    ${card.customName}
    </p>
    </div>
  </div>

  <div style="height:250px; visibility: hidden">pp</div>

  <!-- Front View -->
      <div>
        <img
        src=${backImg}
        width="443px"
        height="279px"
    />
      </div>
      `;

          if (index < getCustomName.length - 1) {
            combinedHTMLContent += "<p style='page-break-before: always'></p>"; // Add page break between contents
          }
        })
      );

      combinedHTMLContent += `
    </body>
    </html>
  `;

      await page.setContent(combinedHTMLContent);
      try {
        await page.waitForSelector("body", { timeout: 60000 });
      } catch (error) {
        loggers.error(error + "Timeout waiting for selector '#content");
        await browser.close();
        return;
      }
      await page.waitForNetworkIdle();

      const pdfBuffer = await page.pdf({
        path: "result.pdf",
        margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
        printBackground: true,
        format: "A4",
      });

      await browser.close();

      const transporter = nodemailer.createTransport({
        host: config.sesSmtpHost,
        port: config.sesSmtpPort,
        secure: false,
        auth: {
          user: config.sesSmtpUsername,
          pass: config.sesSmtpPassword,
        },
      });

      const getUserMailId = await model.Shipping.findOne({
        where: {
          orderId: orderId,
        },
      });

      const mailOptions = {
        from: config.smtpFromEmail,
        to: [getUserMailId.emailId, config.smtpFromEmail],
        subject: `Bubbl order Confirmation, Order no: #${orderId}`,
        html: orderMailContent,
        attachments: [
          {
            filename: "Name Custom Preview.pdf",
            content: pdfBuffer,
          },
        ],
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    loggers.error(err + "from orderEmail.js");
  }
}

async function getOrderDetails(req, res) {
  const userId = req.user.id;

  try {
    const orders = await model.Order.findAll({
      where: {
        customerId: userId,
        cancelledOrder: false,
      },
      include: [
        {
          model: model.Cart,
          where: {
            productStatus: true,
          },
        },
        {
          model: model.Shipping,
        },
        {
          model: model.Payment,
        },
      ],
    });

    // getting the images based on all orders

    let deviceInventory = "";

    const orderImages = await Promise.all(
      orders.map(async (order) => {
        const orderImages = await Promise.all(
          order.Carts.map(async (cartVal) => {
            if (cartVal.productType.includes("NC-")) {
              const getImageId = await model.NameDeviceImageInventory.findOne({
                where: {
                  deviceType: cartVal.productType,
                  deviceColor: cartVal.productColor,
                },
              });
              if (getImageId) {
                const deviceInventory = await model.NameCustomImages.findOne({
                  where: {
                    NameCustomDeviceId: getImageId.id,
                    cardView: false,
                  },
                });

                const itemImg = await generateSignedUrl(
                  deviceInventory.imageUrl
                );

                return itemImg;
              }
            } else {
              deviceInventory = await model.DeviceInventory.findOne({
                where: {
                  deviceType: cartVal.productType,
                  deviceColor: cartVal.productColor,
                },
              });

              const itemImg = await generateSignedUrl(
                deviceInventory.deviceImage
              );
              return itemImg;
            }
          })
        );

        return orderImages;
      })
    );

    const displayNames = await Promise.all(
      orders.map(async (order) => {
        const deviceName = await Promise.all(
          order.Carts.map(async (cartVal) => {
            if (cartVal.productType.includes("NC-")) {
              const productNames = await model.NameDeviceImageInventory.findOne(
                {
                  where: {
                    deviceType: cartVal.productType,
                    deviceColor: cartVal.productColor,
                  },
                }
              );
              if (productNames) {
                return productNames.displayName;
              }
            } else {
              return cartVal.productType;
            }
          })
        );

        return deviceName;
      })
    );

    return res.json({
      success: true,
      message: "Orders Found",
      orderImages,
      displayNames,
      orders,
    });
  } catch (error) {
    console.log(error);
    loggers.error(error + "from getOrderDetails function");
    return res.json({
      success: false,
      message: error,
    });
  }
}
