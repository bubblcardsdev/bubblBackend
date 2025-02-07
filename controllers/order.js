import loggers from "../config/logger.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import model from "../models/index.js";
import { shippingDetails } from "../validations/orderShipping.js";

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
              const productNames = await model.NameDeviceImageInventory.findOne({
                where: {
                  deviceType: cartVal.productType,
                  deviceColor: cartVal.productColor,
                },
              });
              if(productNames)
              {
                return productNames.displayName;
              }
            } 
            else {
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
    loggers.error(error+"from getOrderDetails function");
    return res.json({
      success: false,
      message: error,
    });
  }
}

async function getOrderById(req, res) {
  const userId = req.user.id;
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
            };
          }
         else {
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
          email:emailId,
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
            };
          }
         else {
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
