import model from "../models/index.js";
import {
  addToCartSchema,
  addToNonUserCartSchema,
  getProductId,
} from "../validations/cart.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import logger from "../config/logger.js";
import loggers from "../config/logger.js";
import pkg from "lodash";
import { uploadFileToS3 } from "../middleware/fileUpload.js";
const { isEmpty, sumBy } = pkg;

async function getAllDevices(req, res) {
  try {
    let devices = await model.DeviceInventories.findAll({
      include: [
        { model: model.DeviceImageInventories },
        { model: model.DeviceColorMasters },
        { model: model.DevicePatternMasters },
        { model: model.MaterialTypeMasters },
      ],
    });

    // Transform devices into desired format
    const transformedDevices = await Promise.all(
      devices.map(async (device) => {
        const imageUrls = await Promise.all(
          (device.DeviceImageInventories || []).map((img) =>
            generateSignedUrl(img.imageKey)
          )
        );
        const color = [];
        devices.filter((deviceType) => {
          if (deviceType.name === device.name) {
            deviceType.DeviceColorMaster &&
              color.push(deviceType.DeviceColorMaster.name);
          }
        });

        return {
          productId: device.productId,
          productName: device.name,
          price: device.price,
          discount: device.discountPercentage,
          sellingPrice:
            device.price - (device.price * device.discountPercentage) / 100,
          primaryImage: imageUrls[0] || null,
          secondaryImage: imageUrls[1] || null,
          colors: color,
          // colors: Array.from(
          //   new Set(device.DeviceColorMasters?.map((color) => color.name) || [])
          // ),
        };
      })
    );

    return res.json({
      success: true,
      data: transformedDevices,
    });
  } catch (error) {
    console.error("Error", error);
    loggers.error(`${error} from getAllDevices function`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getProductDetails(req, res) {
  const { productId } = req.body;

  const { error } = getProductId.validate(req.body, {
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
    let devices = await model.DeviceInventories.findAll({
      include: [
        { model: model.DeviceImageInventories },
        { model: model.DeviceColorMasters },
        { model: model.DevicePatternMasters },
        { model: model.MaterialTypeMasters },
      ],
    });
    const productDetail = await model.DeviceInventories.findOne({
      where: {
        productId: productId,
        availability: true,
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
    const color = [];
    const pattern = [];
    const material = [];
    const imageUrls = await Promise.all(
      (productDetail.DeviceImageInventories || []).map((img) =>
        generateSignedUrl(img.imageKey)
      )
    );

    await Promise.all(
      devices.map(async (device) => {
        if (device.deviceTypeId === productDetail.deviceTypeId) {
          const imageUrls = await Promise.all(
            (device.DeviceImageInventories || []).map((img) =>
              generateSignedUrl(img.imageKey)
            )
          );
          device.DeviceColorMaster &&
            color.push(device.DeviceColorMaster.name);
            const check = material.some(materialName=> materialName.material === device.MaterialTypeMaster.name);
          if (!check) {
            console.log(device.MaterialTypeMaster.name);
            
            device.MaterialTypeMaster &&
              material.push({
                material:device.MaterialTypeMaster.name,
                primaryImage: imageUrls[0] || null,
                productId: device.productId,
              });
          }
          if (device.materialTypeId === productDetail.materialTypeId) {
            device.DevicePatternMaster &&
              pattern.push({
                Pattern: device.DevicePatternMaster.name,
                primaryImage: imageUrls[0] || null,
                productId: device.productId,
              });
          }
        }
      })
    );
    
    return res.json({
      success: true,
      data: {
        productId: productDetail.productId,
        productName: productDetail.name,
        price: productDetail.price,
        discount: productDetail.discountPercentage,
        sellingPrice:
          productDetail.price -
          (productDetail.price * productDetail.discountPercentage) / 100,
        shortDesc: productDetail.shortDescription,
        description: productDetail.deviceDescription,
        productDetails: productDetail.productDetails,
        primaryImage:imageUrls[0]||null,
        secondaryImage:imageUrls[1]||null,
        colors: color,
        patterns: pattern,
        material: material,
      },
    });
  } catch (error) {
    logger.error(error, "from the getProductDetails method");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

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
  getProductDetails,
};
