import loggers from "../config/logger.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import model from "../models/index.js";
import {
  checkOutValidation,
  getOrderValidation,
} from "../validations/orderShipping.js";
import { sequelize } from "../models/index.js";
import logger from "../config/logger.js";
import { Op } from "sequelize";

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

async function getOrderById(req, res) {
  const { orderId } = req.body;

  const { error } = getOrderValidation.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res
      .status(500)
      .json({ success: false, data: { error: error.details } });
  }

  try {
    // Fetch order with breakdowns
    const order = await model.Order.findOne({
      where: { id: orderId },
      include: [{ model: model.OrderBreakDown }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Fetch all device images and details in one go
    const deviceImages = await Promise.all(
      order.OrderBreakDowns.map(async (orderBreakdown) => {
        const device = await model.DeviceInventories.findOne({
          where: { id: orderBreakdown.productId },
          include: [
            { model: model.DeviceImageInventories },
            { model: model.DeviceColorMasters },
            { model: model.MaterialTypeMasters },
            { model: model.DevicePatternMasters },
            { model: model.DeviceTypeMasters },
          ],
        });

        if (!device) return null;

        // Generate signed URLs for images
        const signedImages = await Promise.all(
          device.DeviceImageInventories.map(async (img) => ({
            ...img.toJSON(),
            signedUrl: await generateSignedUrl(img.imageKey),
          }))
        );

        return {
          productId: device.productId,
          productName: device.name,
          productColor: device.DeviceColorMaster?.name || null,
          productPattern: device.DevicePatternMaster?.name || null,
          productMaterial: device.MaterialTypeMaster?.name || null,
          productType: device.DeviceTypeMaster?.name || null,
          productPrice: orderBreakdown.price,
          productSellingPrice: orderBreakdown.sellingPrice,
          productDiscount: device.discountPercentage,
          quantity: orderBreakdown.quantity,
          productImages: signedImages,
        };
      })
    );

    const payment = await model.Payment.findOne({
      where: {
        orderId: orderId,
        paymentStatus: true,
      },
    });

    const shippingData = await model.Shipping.findOne({
      where: {
        orderId: orderId,
      },
    });

    const orderStatus = await model.OrderStatusMaster.findOne({
      where: {
        id: order.orderStatusId,
      },
    });
    const payObj = {
      orderNumber: orderId,
      refNo: payment?.bankRefNo,
      paymentStatus: orderStatus.name,
      paidAt: payment?.updatedAt || null,
      payMethod: payment?.paymentMethod || null,
      totalPaidAmount: payment?.amount || 0,
      totalDiscountAmount: order?.discountAmount || 0,
      shippingCost: order?.shippingCharge || 0,
    };

    return res.json({
      success: true,
      message: "Order Details",
      shippingData: shippingData,
      orderObj: deviceImages,
      paymentObj: payObj,
    });
  } catch (error) {
    console.error(`Error in getOrderById: ${error}`);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function cancelOrder(req, res) {
  const userId = req.user.id;
  const { orderId } = req.body;
  try {
    const checkOrder = await model.Order.findOne({
      where: {
        id: orderId,
      },
    });
    if (checkOrder) {
      await model.Order.update(
        {
          orderStatus: "cancelled",
          cancelledOrder: true,
        },
        {
          where: {
            id: orderId,
            customerId: userId,
          },
        }
      );
      return res.json({
        success: true,
        message: "order Deleted",
      });
    }
  } catch (error) {
    loggers.error(error + "from cancelOrder function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

//#region - old logic

// async function checkOut2(req, res) {
//   const userId = req.user.id;
//   const {
//     firstName,
//     lastName,
//     phoneNumber,
//     emailId,
//     flatNumber,
//     address,
//     city,
//     state,
//     zipcode,
//     country,
//     landmark,
//     isShipped,
//   } = req.body;

//   const transaction = await sequelize.transaction();

//   try {
//     // Fetch all cart items for the user
//     const getAllCartItems = await model.Cart.findAll({
//       where: { customerId: userId, productStatus: false },
//       transaction,
//     });

//     if (!getAllCartItems || getAllCartItems.length === 0) {
//       throw new Error("Cannot find items in the cart.");
//     }

//     // Fetch order status
//     const orderStatusMaster = await model.OrderStatusMaster.findOne({
//       where: { id: 1 },
//       transaction,
//     });

//     // Prepare order entries
//     let totalOrderPrice = 0;
//     const orderItems = await Promise.all(
//       getAllCartItems.map(async (cartItem) => {
//         const getDiscount = await model.DeviceInventories.findOne({
//           where: { productId: cartItem.productUUId },
//           transaction,
//         });

//         const discountAmount =
//           (cartItem.productPrice * getDiscount.discountPercentage) / 100;
//         const sellingPrice = cartItem.productPrice - discountAmount;
//         const totalPrice = sellingPrice * cartItem.quantity;

//         totalOrderPrice += totalPrice;

//         return {
//           productUUId: cartItem.productUUId,
//           quantity: cartItem.quantity,
//           totalPrice,
//           discountPercentage: getDiscount.discountPercentage,
//           discountAmount,
//           fontId: cartItem.fontId || null,
//           nameOnCard: cartItem.nameCustomNameOnCard || null,
//           productPrice: getDiscount.price,
//           discountedPrice: sellingPrice,
//         };
//       })
//     );

//     let createdOrder = await model.Order.create(
//       {
//         customerId: userId,
//         totalPrice: totalOrderPrice,
//         cancelledOrder: false,
//         email: emailId,
//         orderStatusId: 1,
//         orderStatus: orderStatusMaster.name || "cart",
//         discountPercentage: orderItems.discountPercentage,
//         discountAmount: orderItems.discountAmount,
//         isLoggedIn: true,
//         fontId: orderItems.fontId,
//         nameOnCard: orderItems.nameOnCard,
//       },
//       { transaction }
//     );
//     const orderBreakdownEntries = orderItems.map((item) => {
//       return {
//         orderId: createdOrder.id,
//         productId: item.productUUId,
//         quantity: item.quantity,
//         originalPrice: item.productPrice,
//         discountedAmount: item.discountAmount,
//         discountedPrice: item.discountedPrice,
//         sellingPrice: item.totalPrice,
//         fontId: item.fontId,
//         nameOnCard: item.nameOnCard,
//       };
//     });
//     await model.OrderBreakDown.bulkCreate(orderBreakdownEntries, {
//       transaction,
//     });
//     await model.Shipping.create(
//       {
//         orderId: createdOrder.id,
//         firstName,
//         lastName,
//         phoneNumber,
//         emailId,
//         flatNumber,
//         address,
//         city,
//         state,
//         zipcode,
//         country,
//         landmark,
//         isShipped: false,
//       },
//       { transaction }
//     );

//     await transaction.commit();

//     return res.json({
//       success: true,
//       message: "Order placed successfully!",
//       orderId: createdOrder.id,
//     });
//   } catch (error) {
//     await transaction.rollback();
//     loggers.error(error.message + " from checkOut function");
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

//#endregion

//#region
// async function checkOut(req, res) {
//   console.log("checkOut function called");
//   const userId = req.user?.id || null;
//   const { productData, shippingFormData } = req.body;
//   const { error } = checkOutValidation.validate(req.body, {
//     abortEarly: false,
//   });
//   if (error) {
//     return res.status(500).json({
//       success: false,
//       data: {
//         error: error.details,
//       },
//     });
//   }

//   const transaction = await sequelize.transaction();

//   try {
//     let cartItems = [];
//     if (userId) {
//       console.log("UserId present");
//       cartItems = await model.Cart.findAll({
//         where: {
//           customerId: userId,
//           productStatus: true,
//           productId: {
//             [Op.ne]: null,
//           },
//         },
//         transaction,
//       });
//       if (!cartItems.length) {
//         throw new Error("Cannot find items in the cart.");
//       }
//     } else {
//       console.log("UserId present Not found");
//       if (!productData || !productData.length) {
//         throw new Error("No products provided for guest checkout.");
//       }

//       console.log(productData, "productData");
//       cartItems = await Promise.all(
//         productData.map(async (item) => {
//           const getProductId = await model.DeviceInventories.findOne({
//             where: {
//               productId: item.productId,
//             },
//             transaction,
//           });

//           if (!getProductId) {
//             return res.status(404).json({
//               success: false,
//               message: "Product not found",
//             });
//           }
//           console.log(getProductId, "getProductId");
//           return {
//             productId: getProductId?.id,
//             quantity: item?.quantity,
//             fontId: item.fontId || null,
//             nameOnCard: item.customName || null,
//           };
//         })
//       );
//     }

//     console.log(cartItems.length, "kk");

//     let shippingCharge = await decideShippingCharge(
//       shippingFormData?.country,
//       transaction
//     );

//     const productDetails = await model.DeviceInventories.findAll({
//       where: { id: cartItems.map((item) => item.productId) },
//       include: [
//         { model: model.DeviceColorMasters },
//         { model: model.DeviceTypeMasters },
//         { model: model.DevicePatternMasters },
//       ],
//       transaction,
//     });

//     if (productDetails.length !== cartItems.length) {
//       throw new Error("One or more products could not be found.");
//     }

//     let totalOrderPrice = 0;
//     let totalDiscountAmount = 0;
//     let totalOriginalPrice = 0;

//     const orderItems = cartItems.map((cartItem, index) => {
//       const product = productDetails[index];

//       const discountAmountPerUnit =
//         (product.price * product.discountPercentage) / 100;
//       const discountedPrice = product.price - discountAmountPerUnit;
//       const totalPrice = discountedPrice * cartItem.quantity;
//       const originalPrice = product.price * cartItem.quantity;
//       const totalDiscountForItem = discountAmountPerUnit * cartItem.quantity;

//       totalOrderPrice += totalPrice;
//       totalDiscountAmount += totalDiscountForItem;
//       totalOriginalPrice += originalPrice;

//       return {
//         productId: cartItem.productId,
//         quantity: cartItem.quantity,
//         totalPrice,
//         discountPercentage: product.discountPercentage,
//         discountAmount: totalDiscountForItem,
//         fontId: cartItem.fontId || null,
//         nameOnCard:
//           cartItem.nameOnCard || cartItem.nameCustomNameOnCard || null,
//         productPrice: product.price,
//         discountedPrice,
//         originalPrice,
//       };
//     });

//     const effectiveDiscountPercentage = totalOriginalPrice
//       ? (totalDiscountAmount / totalOriginalPrice) * 100
//       : 0;

//     console.log("Order Items:", orderItems);
//     console.log(
//       "Effective Discount %:",
//       effectiveDiscountPercentage.toFixed(2)
//     );

//     console.log("Total Order Price:", totalOrderPrice);
//     console.log("Total Discount Amount:", totalDiscountAmount);
//     console.log("Shipping Charge:", shippingCharge);
//     console.log("Shipping Form Data:", shippingFormData);
//     console.log("User ID:", userId);
//     // throw new Error("Test error"); // For testing error handling
//     // Create Order
//     const createdOrder = await model.Order.create(
//       {
//         customerId: userId,
//         totalPrice: totalOrderPrice,
//         email: shippingFormData?.emailId,
//         orderStatusId: 1,
//         discountAmount: totalDiscountAmount,
//         isLoggedIn: !!userId,
//         shippingCharge: shippingCharge,
//       },
//       { transaction }
//     );

//     // Bulk insert order breakdown
//     await model.OrderBreakDown.bulkCreate(
//       orderItems.map((item) => ({
//         orderId: createdOrder.id,
//         productId: item.productId,
//         quantity: item.quantity,
//         originalPrice: item.originalPrice,
//         discountedAmount: item.discountAmount,
//         discountedPrice: item.discountedPrice,
//         discountPercentage: item.discountPercentage,
//         sellingPrice: item.totalPrice,
//         fontId: item.fontId,
//         customName: item.customName,
//       })),
//       { transaction }
//     );

//     // Create Shipping entry
//     await model.Shipping.create(
//       {
//         orderId: createdOrder.id,
//         firstName: shippingFormData?.firstName,
//         lastName: shippingFormData?.lastName,
//         phoneNumber: shippingFormData?.phoneNumber,
//         emailId: shippingFormData?.emailId,
//         flatNumber: shippingFormData?.flatNumber,
//         address: shippingFormData?.address,
//         city: shippingFormData?.city,
//         state: shippingFormData?.state,
//         zipcode: shippingFormData?.zipcode,
//         country: shippingFormData?.country,
//         landmark: shippingFormData?.landmark,
//         isShipped: false,
//       },
//       { transaction }
//     );

//     await transaction.commit();

//     return res.json({
//       success: true,
//       message: "Order placed successfully!",
//       orderId: createdOrder.id,
//     });
//   } catch (error) {
//     await transaction.rollback();
//     logger.error(`${error.message} from checkOut function`);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred during checkout.",
//       error: error.message,
//     });
//   }
// }
//#endregion

//#region  - checkout with order update
// async function checkOut(req, res) {
//   const userId = req.user?.id || null;
//   const { productData, shippingFormData } = req.body;
//   const { error } = checkOutValidation.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     return res
//       .status(500)
//       .json({ success: false, data: { error: error.details } });
//   }

//   const transaction = await sequelize.transaction();

//   try {
//     let cartItems = [];

//     if (userId) {
//       cartItems = await model.Cart.findAll({
//         where: {
//           customerId: userId,
//           productStatus: true,
//           productId: { [Op.ne]: null },
//         },
//         transaction,
//       });

//       if (!cartItems.length) throw new Error("Cannot find items in the cart.");
//     } else {
//       if (!productData || !productData.length)
//         throw new Error("No products provided for guest checkout.");
//       const productIdMap = {};

//       for (const item of productData) {
//         if (!item.productId) continue;

//         if (productIdMap[item.productId]) {
//           throw new Error(
//             `Duplicate productId found: ${item.productId}. Please update quantity instead of repeating the product.`
//           );
//         } else {
//           productIdMap[item.productId] = true;
//         }
//       }

//       cartItems = await Promise.all(
//         productData.map(async (item) => {
//           const getProductId = await model.DeviceInventories.findOne({
//             where: { productId: item.productId },
//           });

//           if (!getProductId) {
//             throw new Error(`Product not found: ${item.productId}`);
//           }

//           if (getProductId.deviceTypeId === 6) {
//             if (!item.customName || !item.fontId) {
//               throw new Error(
//                 `FontId and CustomName are required for product - ${item.productId}`
//               );
//             }
//           }

//           return {
//             productId: getProductId.id,
//             quantity: item.quantity,
//             fontId: item.fontId || null,
//             nameOnCard: item.customName || null,
//           };
//         })
//       );
//     }

//     const shippingCharge = await decideShippingCharge(
//       shippingFormData?.country,
//       transaction
//     );

//     const productDetails = await model.DeviceInventories.findAll({
//       where: { id: cartItems.map((item) => item.productId) },
//       include: [
//         { model: model.DeviceColorMasters },
//         { model: model.DeviceTypeMasters },
//         { model: model.DevicePatternMasters },
//       ],
//       transaction,
//     });

//     if (productDetails.length !== cartItems.length)
//       throw new Error("One or more products could not be found.");

//     let totalOrderPrice = 0;
//     let totalDiscountAmount = 0;
//     let totalOriginalPrice = 0;

//     const orderItems = cartItems.map((cartItem, index) => {
//       const product = productDetails[index];
//       const discountAmountPerUnit =
//         (product.price * product.discountPercentage) / 100;
//       const discountedPrice = product.price - discountAmountPerUnit;
//       const totalPrice = discountedPrice * cartItem.quantity;
//       const originalPrice = product.price * cartItem.quantity;
//       const totalDiscountForItem = discountAmountPerUnit * cartItem.quantity;

//       totalOrderPrice += totalPrice;
//       totalDiscountAmount += totalDiscountForItem;
//       totalOriginalPrice += originalPrice;

//       return {
//         productId: cartItem.productId,
//         quantity: cartItem.quantity,
//         totalPrice,
//         discountPercentage: product.discountPercentage,
//         discountAmount: totalDiscountForItem,
//         fontId: cartItem.fontId || null,
//         nameOnCard:
//           cartItem.nameOnCard || cartItem.nameCustomNameOnCard || null,
//         productPrice: product.price,
//         discountedPrice,
//         originalPrice,
//       };
//     });

//     let createdOrder = null;

//     createdOrder = await model.Order.create(
//       {
//         customerId: userId,
//         totalPrice: totalOrderPrice,
//         email: shippingFormData?.emailId,
//         orderStatusId: 1,
//         discountAmount: totalDiscountAmount,
//         isLoggedIn: !!userId,
//         shippingCharge: shippingCharge,
//       },
//       { transaction }
//     );

//     await model.OrderBreakDown.bulkCreate(
//       orderItems.map((item) => ({
//         orderId: createdOrder.id,
//         productId: item.productId,
//         quantity: item.quantity,
//         originalPrice: item.originalPrice,
//         discountedAmount: item.discountAmount,
//         discountedPrice: item.discountedPrice,
//         discountPercentage: item.discountPercentage,
//         sellingPrice: item.totalPrice,
//         fontId: item.fontId,
//         customName: item.nameOnCard,
//       })),
//       { transaction }
//     );

//     await model.Shipping.create(
//       {
//         orderId: createdOrder.id,
//         firstName: shippingFormData?.firstName,
//         lastName: shippingFormData?.lastName,
//         phoneNumber: shippingFormData?.phoneNumber,
//         emailId: shippingFormData?.emailId,
//         flatNumber: shippingFormData?.flatNumber,
//         address: shippingFormData?.address,
//         city: shippingFormData?.city,
//         state: shippingFormData?.state,
//         zipcode: shippingFormData?.zipcode,
//         country: shippingFormData?.country,
//         landmark: shippingFormData?.landmark,
//         isShipped: false,
//       },
//       { transaction }
//     );

//     await transaction.commit();

//     return res.json({
//       success: true,
//       message: "Order placed successfully!",
//       orderId: createdOrder.id,
//     });
//   } catch (error) {
//     await transaction.rollback();
//     logger.error(`${error.message} from checkOut function`);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }
//#endregion

async function checkOut(req, res) {
  const userId = req.user?.id || null;
  const { productData, shippingFormData } = req.body;
  const { error } = checkOutValidation.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res
      .status(500)
      .json({ success: false, data: { error: error.details } });
  }

  const transaction = await sequelize.transaction();

  try {
    let cartItems = [];

    if (userId) {
      cartItems = await model.Cart.findAll({
        where: {
          customerId: userId,
          productStatus: true,
          productId: { [Op.ne]: null },
        },
        transaction,
      });

      if (!cartItems.length) throw new Error("Cannot find items in the cart.");
    } else {
      if (!productData || !productData.length)
        throw new Error("No products provided for guest checkout.");
      const productIdMap = {};

      for (const item of productData) {
        if (!item.productId) continue;

        if (productIdMap[item.productId]) {
          throw new Error(
            `Duplicate productId found: ${item.productId}. Please update quantity instead of repeating the product.`
          );
        } else {
          productIdMap[item.productId] = true;
        }
      }

      cartItems = await Promise.all(
        productData.map(async (item) => {
          const getProductId = await model.DeviceInventories.findOne({
            where: { productId: item.productId },
          });

          if (!getProductId) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          if (getProductId.deviceTypeId === 6) {
            if (!item.customName || !item.fontId) {
              throw new Error(
                `FontId and CustomName are required for product - ${item.productId}`
              );
            }
          }

          return {
            productId: getProductId.id,
            quantity: item.quantity,
            fontId: item.fontId || null,
            nameOnCard: item.customName || null,
          };
        })
      );
    }

    const shippingCharge = await decideShippingCharge(
      shippingFormData?.country,
      transaction
    );

    const productDetails = await model.DeviceInventories.findAll({
      where: { id: cartItems.map((item) => item.productId) },
      include: [
        { model: model.DeviceColorMasters },
        { model: model.DeviceTypeMasters },
        { model: model.DevicePatternMasters },
      ],
      transaction,
    });

    if (productDetails.length !== cartItems.length)
      throw new Error("One or more products could not be found.");

    let totalOrderPrice = 0;
    let totalDiscountAmount = 0;
    let totalSellingPrice = 0;

    const orderItems = cartItems.map((cartItem, index) => {
      console.log(
        cartItem.quantity,
        cartItem.customName,
        cartItem.fontId,
        "ite,sss"
      );
      const product = productDetails[index];
      const quantity = cartItem.quantity;

      const originalPricePerUnit = product.price;
      const discountAmountPerUnit =
        (originalPricePerUnit * product.discountPercentage) / 100;
      const discountedPricePerUnit =
        originalPricePerUnit - discountAmountPerUnit;

      totalOrderPrice += originalPricePerUnit * quantity;
      totalSellingPrice += discountedPricePerUnit * quantity;
      totalDiscountAmount += discountAmountPerUnit * quantity;

      return {
        productId: cartItem.productId,
        quantity,
        originalPrice: originalPricePerUnit, // per unit
        discountAmount: discountAmountPerUnit, // per unit
        discountedPrice: discountedPricePerUnit, // per unit
        discountPercentage: product.discountPercentage,
        sellingPrice: discountedPricePerUnit, // per unit
        fontId: cartItem.fontId || null,
        customName: cartItem.customName || null,
      };
    });

    const createdOrder = await model.Order.create(
      {
        customerId: userId,
        totalPrice: totalOrderPrice,
        email: shippingFormData?.emailId,
        orderStatusId: 1,
        discountAmount: totalDiscountAmount,
        isLoggedIn: !!userId,
        shippingCharge: shippingCharge,
        soldPrice: totalSellingPrice,
      },
      { transaction }
    );

    // Create OrderBreakDowns (unit prices only)
    await model.OrderBreakDown.bulkCreate(
      orderItems.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        originalPrice: item.originalPrice, // per unit
        discountedAmount: item.discountAmount, // per unit
        discountedPrice: item.discountedPrice, // per unit
        discountPercentage: item.discountPercentage,
        sellingPrice: item.sellingPrice, // per unit
        fontId: item.fontId,
        customName: item.customName,
      })),
      { transaction }
    );

    await model.Shipping.create(
      {
        orderId: createdOrder.id,
        firstName: shippingFormData?.firstName,
        lastName: shippingFormData?.lastName,
        phoneNumber: shippingFormData?.phoneNumber,
        emailId: shippingFormData?.emailId,
        flatNumber: shippingFormData?.flatNumber,
        address: shippingFormData?.address,
        city: shippingFormData?.city,
        state: shippingFormData?.state,
        zipcode: shippingFormData?.zipcode,
        country: shippingFormData?.country,
        landmark: shippingFormData?.landmark,
        isShipped: false,
      },
      { transaction }
    );

    await transaction.commit();

    return res.json({
      success: true,
      message: "Order placed successfully!",
      orderId: createdOrder.id,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`${error.message} from checkOut function`);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function decideShippingCharge(userCountry, transaction) {
  // try {
    const shippingCharges = await model.ShippingCharge.findAll({ transaction });

    const country = userCountry || "Others";

    let selectedShipping = shippingCharges.find(
      (charge) => charge.country.toLowerCase() === country.toLowerCase()
    );

    if (!selectedShipping) {
      selectedShipping = shippingCharges.find(
        (charge) => charge.country.toLowerCase() === "others"
      );
    }

    const shippingChargeAmount = selectedShipping ? selectedShipping.amount : 0;

    return shippingChargeAmount;
  // } catch (error) {
  //   throw error;
  // }
}

async function checkOutNonUser(req, res) {
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
        email: emailId,
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
          email: emailId,
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
async function updateShippingDetails(req, res) {
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
  try {
    const checkShipping = await model.Shipping.findOne({
      where: {
        orderId: orderId,
      },
    });
    if (checkShipping) {
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
        message: "Details updated",
        updateShippingDetails,
      });
    }
  } catch (error) {
    loggers.error(error + "from updateShippingDetails function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function proceedPayment(req, res) {
  const userId = req.user.id;
  const { orderId } = req.body;
  try {
    const checkPaymentOrder = await model.Payment.findOne({
      where: {
        orderId,
        customerId: userId,
      },
    });
    if (checkPaymentOrder) {
      const checkPaymentStatus = await model.Payment.findOne({
        where: {
          paymentStatus: false,
        },
      });
      if (checkPaymentStatus) {
        //integrate payment
        const changePaymentStatus = await model.Payment.update(
          {
            paymentStatus: true,
          },
          {
            where: {
              orderId,
            },
          }
        );
        await model.Order.update(
          {
            orderStatus: "Paid",
          },
          {
            where: {
              id: orderId,
            },
          }
        );
        return res.json({
          success: true,
          message: "Payment Completed",
          changePaymentStatus,
        });
      } else {
        await model.Order.update(
          {
            orderStatus: "Paid",
          },
          {
            where: {
              id: orderId,
            },
          }
        );
        return res.json({
          success: true,
          message: "Order Status changed",
        });
      }
    }
  } catch (error) {
    loggers.error(error + "from proceedPayment function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function getNonUserOrderById(req, res) {
  const { orderId } = req.body;
  try {
    const order = await model.Order.findAll({
      where: {
        id: orderId,
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

export {
  getOrderDetails,
  getOrderById,
  updateShippingDetails,
  checkOut,
  proceedPayment,
  cancelOrder,
  checkOutNonUser,
  getNonUserOrderById,
};
