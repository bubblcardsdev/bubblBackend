import model from "../models/index.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";

// function for getting all false shipping Orders
async function getTotalOrderServices() {
  const orderId = await model.Order.findAll({
    include: [
      { model: model.Cart },
      {
        model: model.Shipping,
        where: {
          isShipped: false,
        },
      },
      {
        model: model.Payment,
        attributes: {
          exclude: ["createdAt", "updatedAt","email","totalPrice"],
        },
      },
      {
        model: model.User,
        attributes: {
          exclude: [
            // to remove unwanted the attributes from user tables
            "userImage",
            "firstName",
            "lastName",
            "gender",
            "DOB",
            "country",
            "countryCode",
            "phoneNumber",
            "password",
            "otp",
            "forgotPasswordId",
            "emailVerificationId",
            "otpExpiresIn",
            "phoneVerified",
            "emailVerified",
            "local",
            "google",
            "facebook",
            "linkedin",
            "signupType",
            "createdAt",
            "updatedAt",
          ],
        },
        required: false,
      },
    ],
  });
  return orderId;
}

// function for getting all true shipping Orders
async function getShippedOrderServices() {
  const orderId = await model.Order.findAll({
    include: [
      { model: model.Cart },
      {
        model: model.Shipping,
        where: {
          isShipped: true,
        },
      },
      {
        model: model.Payment,
        attributes: {
          exclude: ["createdAt", "updatedAt","email"],
        },
      },
      {
        model: model.User,
        attributes: {
          exclude: [
            // to remove unwanted the attributes from user tables
            "userImage",
            "firstName",
            "lastName",
            "gender",
            "DOB",
            "country",
            "countryCode",
            "phoneNumber",
            "password",
            "otp",
            "forgotPasswordId",
            "emailVerificationId",
            "otpExpiresIn",
            "phoneVerified",
            "emailVerified",
            "local",
            "google",
            "facebook",
            "linkedin",
            "signupType",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    ],
  });
  return orderId;
}


// function for getting Cont for the Orders
async function getCountServices() {
  const orderCount = model.Order.count();
  return orderCount;
}


// function for getting count for the pendingOrders

async function PendingOrderCountServices() {
  const pendingOrders = await model.Shipping.findAll({
    where: {
      isShipped: false,
    },
  });
  const pendingOrderCount = pendingOrders.length;
  return pendingOrderCount;
}

// get orders by orderId
// async function getOrderByIdServices(res, orderId) {
//   const checkOrderId = await model.Cart.findOne({
//     where: {
//       orderId: orderId,
//     },
//   });
//   console.log(checkOrderId, "checkorder id");
//   if (checkOrderId) {
//     const getOrderByIdVal = await model.Cart.findAll({
//       where: {
//         orderId: checkOrderId.id,
//       },
//     });
//     console.log(getOrderByIdVal, "getOrderByIdValgetOrderByIdVal");
//     return res.json({
//       success: true,
//       message: "Order Found",
//       getOrderByIdVal,
//     });
//   } else {
//     res.json({
//       success: false,
//       message: "Order not found",
//     });
//   }
//   const cartDetails = await model.Cart.findAll();
//   return cartDetails;
// }

async function getOrderByIdServices(res, orderId, userId) {
  try {
    const order = await model.Order.findAll({
      where: {
        id: orderId,
        // customerId: userId,
        // cancelledOrder: false,
      },
      include: [
        {
          model: model.Cart,
          // where: {
          //   productStatus: true,
          // },
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
    
    if(order.length > 0){deviceImages = await Promise.all(
      order[0]?.Carts?.map(async (cartVal) => {
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
    );}

    return res.json({
      success: true,
      message: "Order Details",
      order,
      deviceImages,
    });
  } catch (error) {
    // try {
    //   const order = await model.Order.findAll({
    //     where: {
    //       id: orderId,
    //       customerId: userId,
    //       cancelledOrder: false,
    //     },
    //     include: [
    //       {
    //         model: model.Cart,
    //         where: {
    //           productStatus: true,
    //         },
    //       },
    //       {
    //         model: model.Shipping,
    //       },
    //       {
    //         model: model.Payment,
    //       },
    //     ],
    //   });

    //   // func for getting the images for corresponding orders
    //   let deviceImages = [];
    //   let deviceInventory = "";

    //   console.log(order, deviceImages, "deviceImages deviceImages deviceImages");

    //   // deviceImages = await Promise.all(
    //   //   order[0]?.Carts.map(async (cartVal) => {
    //   //     console.log(cartVal, "cartVal cartVal cartVal cartVal");
    //   //     if (cartVal.productType.includes("NC-")) {
    //   //       const getImageId = await model.NameDeviceImageInventory.findOne({
    //   //         where: {
    //   //           deviceType: cartVal.productType,
    //   //           deviceColor: cartVal.productColor,
    //   //         },
    //   //       });
    //   //       if (getImageId) {
    //   //         const deviceInventory = await model.NameCustomImages.findOne({
    //   //           where: {
    //   //             NameCustomDeviceId: getImageId.id,
    //   //             cardView: true,
    //   //           },
    //   //         });

    //   //         const itemImg = await generateSignedUrl(deviceInventory.imageUrl);

    //   //         return itemImg;
    //   //       }
    //   //     } else {
    //   //       deviceInventory = await model.DeviceInventory.findOne({
    //   //         where: {
    //   //           deviceType: cartVal.productType,
    //   //           deviceColor: cartVal.productColor,
    //   //         },
    //   //       });

    //   //       const itemImg = await generateSignedUrl(deviceInventory.deviceImage);
    //   //       return itemImg;
    //   //     }
    //   //   })
    //   // );
    //   // deviceImages = await Promise.all(
    //   //   order[0].Carts.map(async (cartVal) => {
    //   //     const deviceInventory = await model.DeviceInventory.findOne({
    //   //       where: {
    //   //         deviceType: cartVal.productType,
    //   //         deviceColor: cartVal.productColor,
    //   //       },
    //   //     });
    //   //     const itemImg = await generateSignedUrl(deviceInventory.deviceImage);

    //   //     return itemImg;
    //   //   })
    //   // );

    //   return res.json({
    //     success: true,
    //     message: "Order Details",
    //     order,
    //     // deviceImages,
    //   });
    // }
    return res.json({
      success: false,
      message: error.message,
    });
  }
}
async function updateOrderStatusServices(res, userId, orderId, orderStatus) {
  const checkOrderId = await model.Shipping.findOne({
    where: {
      orderId: orderId,
    },
  });
  if (checkOrderId) {
    const updateOrder = await model.Shipping.update(
      {
        isShipped: true,
      },
      {
        where: {
          orderId: orderId,
        },
      }
    );
    return res.json({
      success: true,
      message: "Updated",
    });
  } else {
    return res.json({
      success: false,
      message: "Order Not Found",
    });
  }
}

export {
  getTotalOrderServices,
  getCountServices,
  PendingOrderCountServices,
  getOrderByIdServices,
  updateOrderStatusServices,
  getShippedOrderServices,
};
