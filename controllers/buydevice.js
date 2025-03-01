import model from "../models/index.js";
import {
  addToCartSchema,
  productListSchema,
  addToNonUserCartSchema,
} from "../validations/cart.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import logger from "../config/logger.js";
import loggers from "../config/logger.js";
import pkg from "lodash";
import { uploadFileToS3 } from "../middleware/fileUpload.js";
const { isEmpty, sumBy } = pkg;
// import device from "../models/device.cjs";

async function getAllDevices(req, res) {
  try {
    let devices = await model.DeviceInventory.findAll({
      where: {
        availability: true,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: model.NameCustomImages,
          attributes: ["imageUrl"],
        },
      ],
      order: [["id", "ASC"]],
    });
    // get all devices types from the table
    const deviceName = devices.reduce((deviceType, device) => {
      const deviceNames = device.deviceType;
      if (!deviceType.includes(deviceNames)) {
        deviceType.push(deviceNames);
      }
      return deviceType;
    }, []);

    devices = await Promise.all(
      deviceName.map(async (data) => {
        // Filter the values by device name
        let dbDataValues = devices.filter(
          (device) => device.deviceType === data
        );
        const colorArray = [];
        let ProductId = dbDataValues[0].id;
        let ProductPrice = dbDataValues[0].price;
        let ProductName = dbDataValues[0].deviceName;
        let discountPercentage = dbDataValues[0].discountPercentage;
        let discount = ProductPrice;
        let deviceImage = null;
        let secondaryImage = null;

        if (dbDataValues[0].NameCustomImages.length > 0) {
          deviceImage = dbDataValues[0].NameCustomImages[0].imageUrl;
          secondaryImage = dbDataValues[0].NameCustomImages[1].imageUrl;
        }
        dbDataValues.map(async (data) => {
          colorArray.push(data.deviceColor);
        });

        deviceImage = await generateSignedUrl(deviceImage);
        if (secondaryImage) {
          secondaryImage = await generateSignedUrl(secondaryImage);
        }

        if (discountPercentage > 0) {
          discount = ProductPrice - ProductPrice * (discountPercentage / 100);
        };

        return {
          productId: ProductId,
          productType: data,
          productName: ProductName,
          price: ProductPrice,
          discount: discountPercentage,
          sellingPrice: discount,
          primaryImage: deviceImage,
          secondaryImage: secondaryImage,
          colors: colorArray,
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

async function productList(req, res) {
  const { id } = req.body;
  const { error } = productListSchema.validate(req.body, {
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
  const data = await model.DeviceInventory.findOne({
    where: {
      id,
    },
    include: [
      {
        model: model.NameCustomImages,
        attributes: ["imageUrl"],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });
  const { deviceType } = data;
  let devices = await model.DeviceInventory.findAll({
    where: {
      deviceType,
    },
    include: [
      {
        model: model.NameCustomImages,
        attributes: ["imageUrl"],
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
    order: [["id", "ASC"]],
  });
  let colorArray = [];
  let patternArray = [];
  let discount = data.price;

  devices.map(async (data) => {
    if(deviceType.toLowerCase().includes("name")){
      patternArray.push({
        pattern: data.deviceColor,
        id: data.id,
        image: await generateSignedUrl(data.NameCustomImages[0].imageUrl)
      });
    }else{
      colorArray.push({
        color: data.deviceColor,
        id: data.id,
      });
    }
  });

  const dataArray = [];
  if (data.deviceType.toLowerCase().includes("name")) {
    const deviceType = [];
    await Promise.all(
      devices.map(async (device) => {
        const deviceNames = device.deviceName;
        if (!deviceType.includes(deviceNames)) {
          deviceType.push(deviceNames);
          const image = await generateSignedUrl(
            device.NameCustomImages[0].imageUrl
          );
          dataArray.push({
            deviceId: device.id,
            deviceName: device.deviceName,
            image: image,
          });
        }
      })
    );
  }

  if (data.discountPercentage) {
    discount =
      Number(data.price) -
      Number(data.price) * (Number(data.discountPercentage) / 100);
  }
  let primaryImage = null;
  let secondaryImage = null;
  if (data.NameCustomImages.length === 2) {
    primaryImage = await generateSignedUrl(data.NameCustomImages[0].imageUrl);
    secondaryImage = await generateSignedUrl(data.NameCustomImages[1].imageUrl);
  } else {
    throw new Error("Images are missing for products.");
  }

  return res.json({
    success: true,
    data: {
      product_id: data.id,
      productType: data.deviceType,
      productName: data.productName,
      price: data.price,
      discount: data.discountPercentage,
      sellingPrice: discount,
      shortDesc: data.shortDescription,
      description: data.deviceDescription,
      productDetails: data.productDetails,
      primaryImage: primaryImage,
      secondaryImage: secondaryImage,
      colors: colorArray,
      patterns: patternArray,
      deviceName: dataArray,
    },
  });
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

// async function clearCartNonUser(req, res) {

//   try {
//     const {email} = req.body;
//     const clearCartRequest = await model.Order.findOne({
//       where: {
//         email,
//         orderStatus: "cart",
//       },
//     });

//     if (clearCartRequest) {
//       await model.Order.update(
//         {
//           orderStatus: "cancelled",
//           cancelledOrder: true,
//         },
//         {
//           where: {
//             id: clearCartRequest.id,
//           },
//         }
//       );

//       await model.Cart.update(
//         {
//           productStatus: false,
//         },
//         {
//           where: {
//             orderId: clearCartRequest.id,
//             email,
//           },
//         }
//       );

//       return res.json({
//         success: true,
//         message: "cart cleared",
//       });
//     } else {
//       return res.json({
//         success: false,
//         message: "Order was already cleared",
//       });
//     }
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

// async function addToNonUserCart(req, res) {
//   try {
//     const { cartItem, email } = req.body;

//     const { error } = addToNonUserCartSchema.validate(req.body, {
//       abortEarly: false,
//     });

//     if (error) {
//       return res.json({
//         success: false,
//         data: {
//           error: error.details,
//         },
//       });
//     }

//     let getOrder = await model.Order.create({
//       email: email,
//       totalPrice: cartItem.productPrice,
//       orderStatus: "cart",
//     });

//     const checkCart = await model.Cart.findOne({
//       where: {
//         orderId: getOrder.id,
//         productType: cartItem.productType,
//         productColor: cartItem.productColor,
//       },
//     });
//     let getProduct = await model.DeviceInventory.findOne({
//       where: {
//         deviceType: cartItem.productType,
//         deviceColor: cartItem.productColor,
//       },
//     });

//     if (getProduct === null) {
//       return res.json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     let productCost = getProduct.price * cartItem.quantity;

//     console.log(productCost, "cost");
//     if (checkCart === null) {
//       await model.Cart.create({
//         productType: cartItem.productType,
//         email: email,
//         orderId: getOrder.id,
//         quantity: cartItem.quantity,
//         productColor: cartItem.productColor,
//         productPrice: productCost,
//         productStatus: cartItem.productStatus,
//       });
//     } else {
//       // let quantity = checkCart.quantity;
//       // let productPrice = checkCart.productPrice;
//       if (checkCart.productStatus) {
//         // quantity += cartItem.quantity;
//         // productPrice += getProduct.productPrice;

//         await model.Cart.update(
//           {
//             quantity: cartItem.quantity,
//             productPrice: productCost,
//           },
//           {
//             where: {
//               id: checkCart.id,
//             },
//           }
//         );
//       } else {
//         await model.Cart.update(
//           {
//             quantity: cartItem.quantity,
//             productPrice: productCost,
//             productStatus: true,
//           },
//           {
//             where: {
//               id: checkCart.id,
//             },
//           }
//         );
//       }
//     }

//     const getCartPrice = await model.Cart.sum("productPrice", {
//       where: { orderId: getOrder.id, productStatus: true },
//     });

//     await model.Order.update(
//       { totalPrice: getCartPrice },
//       { where: { email: email, orderStatus: "cart" } }
//     );

//     return res.json({
//       success: true,
//       data: {
//         message: "Cart Updated successfully",
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     logger.error(error, "from addToCart function");
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

async function getNonUserCart(req, res) {
  const email = req?.query?.email;
  try {
    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }
    const cart = await model.Order.findOne({
      attributes: { exclude: ["ShippingId", "PaymentId"] },
      where: {
        email: email,
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

async function cancelNonUserCart(req, res) {
  const { orderId, cartId, email } = req.body;

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
              email,
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

async function clearCartNonuser(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({
        success: false,
        message: "Email required",
      });
    }

    const clearCartRequest = await model.Order.findOne({
      where: {
        email,
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
            email,
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
        } else {
          const checkOthers = await model.DeviceInventory.findOne({
            where: {
              deviceType: item?.productType,
              deviceColor: item?.productColor,
            },
          });
          item["totalPrice"] = checkOthers.price * item?.quantity;
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
    console.log("Addding to cart");
    const cartItems = cartData.map((item) => {
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
export {
  getAllDevices,
  addToCart,
  getCart,
  cancelCart,
  clearCart,
  addToNonUserCart,
  getNonUserCart,
  cancelNonUserCart,
  clearCartNonuser,
  productList,
};
