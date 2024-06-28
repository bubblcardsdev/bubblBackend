import model from "../models/index.js";
import { addToCartSchema } from "../validations/cart.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import logger from "../config/logger.js";
import loggers from "../config/logger.js";

async function getAllDevices(req, res) {
  try {
    let devices = await model.DeviceInventory.findAll({});

    devices = await Promise.all(
      devices.map(async (device) => {
        let deviceImage = await generateSignedUrl(device.deviceImage);
        return {
          id: device.id,
          deviceType: device.deviceType,
          deviceColor: device.deviceColor,
          deviceImage: deviceImage,
          deviceDescription: device.deviceDescription,
          price: device.price,
          availability: device.availability,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        devices,
      },
    });
  } catch (error) {
    console.log("Error", error);
    loggers.error(error + "from getAllDevices function");
    return res.json({
      success: false,
      data: {
        message: error,
      },
    });
  }
}

async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { cartItem } = req.body;

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

    console.log(productCost, "cost");
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

async function getCart(req, res) {
  const userId = req.user.id;
  try {
    const cart = await model.Order.findOne({
      attributes: { exclude: ["ShippingId", "PaymentId"] },
      where: {
        customerId: userId,
        orderStatus: "cart",
      },
      include: {
        model: model.Cart,
        where: {
          productStatus: true,
        },
      },
    });
    let deviceImages = [];
    let deviceInventory = "";
    let productPrice = [];
    let displayName = [];
    let cartLength = "";

    deviceImages = await Promise.all(
      cart.Carts.map(async (cartVal) => {
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
          cartLength = cart?.Carts?.length || 0;

          return itemImg;
        }
      })
    );

    productPrice = await Promise.all(
      cart.Carts.map(async (cartVal) => {
        if (cartVal.productType.includes("NC-")) {
          const deviceInventData = await model.NameDeviceImageInventory.findOne(
            {
              where: {
                deviceType: cartVal.productType,
              },
            }
          );
          return deviceInventData.price;
        } else {
          const deviceInvent = await model.DeviceInventory.findOne({
            where: {
              deviceType: cartVal.productType,
            },
          });
          return deviceInvent.price;
        }
      })
    );

    displayName = await Promise.all(
      cart.Carts.map(async (cartVal) => {
        if (cartVal.productType.includes("NC-")) {
          const deviceInventData = await model.NameDeviceImageInventory.findOne(
            {
              where: {
                deviceType: cartVal.productType,
              },
            }
          );
          return deviceInventData.displayName;
        } else {
          const deviceInvent = await model.DeviceInventory.findOne({
            where: {
              deviceType: cartVal.productType,
            },
          });
          return deviceInvent.deviceType;
        }
      })
    );

    return res.json({
      success: true,
      data: {
        message: "Cart Details",
        cartLength,
        cart,
        productPrice,
        deviceImages,
        displayName,
      },
    });
  } catch (error) {
    logger.error(error.message);
    console.log(error);
    return res.json({
      success: false,
      data: {
        message: error.message,
      },
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

async function clearCart(req, res) {
  const userId = req.user.id;

  try {
    const clearCartRequest = await model.Order.findOne({
      where: {
        customerId: userId,
        orderStatus: "cart",
      },
    });

    if (clearCartRequest) {
      await model.Order.update(
        {
          orderStatus: "cancelled",
          cancelledOrder: true,
        },
        {
          where: {
            id: clearCartRequest.id,
          },
        }
      );

      await model.Cart.update(
        {
          productStatus: false,
        },
        {
          where: {
            orderId: clearCartRequest.id,
            customerId: userId,
          },
        }
      );

      return res.json({
        success: true,
        message: "cart cleared",
      });
    } else {
      return res.json({
        success: false,
        message: "Order was already cleared",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}
export { getAllDevices, addToCart, getCart, cancelCart, clearCart };
