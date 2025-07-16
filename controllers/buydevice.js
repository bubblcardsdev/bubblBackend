import model from "../models/index.js";
import {
  addToCartSchema,
  addToNonUserCartSchema,
  cancelCartValidation,
  getProductId,
} from "../validations/cart.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import logger from "../config/logger.js";
import loggers from "../config/logger.js";

import { sequelize } from "../models/index.js";
import pkg from "lodash";

const { isEmpty } = pkg;

async function getAllDevices(req, res) {
  try {
    let devices = await model.DeviceInventories.findAll({
      include: [
        { model: model.DeviceImageInventories },
        { model: model.DeviceColorMasters },
        { model: model.DevicePatternMasters },
        { model: model.MaterialTypeMasters },
      ],
      group: ["deviceTypeId", "materialTypeId", "colorId", "patternId"],
    });

    if (!devices || devices.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No devices found. Something went wrong while fetching devices",
      });
    }

    const transformedDevices = await Promise.all(
      devices.map(async (device) => {
        const imageUrls = await Promise.all(
          (device.DeviceImageInventories || []).map((img) =>
            generateSignedUrl(img.imageKey)
          )
        );
        const color = [];
        devices.filter((deviceType) => {
          if (
            deviceType.name === device.name &&
            deviceType.deviceTypeId === 6
          ) {
            deviceType.DevicePatternMaster &&
              !color.includes(deviceType.DevicePatternMaster.name) &&
              color.push(deviceType.DevicePatternMaster.name);
          } else if (deviceType.name === device.name) {
            deviceType.DeviceColorMaster &&
              color.push(deviceType.DeviceColorMaster.colorCode);
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
          material: device.MaterialTypeMaster.name,
          deviceTypeId: device.deviceTypeId,
        };
      })
    );

    const uniqueItems = [];

    let removeDuplicates = transformedDevices.map((item) => {
      const findItem = !isEmpty(uniqueItems)
        ? uniqueItems.find(
            (product) =>
              product.name === item.productName &&
              product.material === item.material
          )
        : null;
      if (!findItem) {
        uniqueItems.push({ name: item.productName, material: item.material });
        return item;
      }
    });

    removeDuplicates = removeDuplicates.filter((item) => item !== undefined);

    const basicTypes = [1, 2, 3];
    const finalResponse = {
      basic: [],
      custom: [],
      others: [],
    };

    removeDuplicates.map((record) => {
      if (basicTypes.includes(record.deviceTypeId)) {
        finalResponse.basic.push(record);
      } else if (record.productName.includes("Custom")) {
        finalResponse.custom.push(record);
      } else {
        finalResponse.others.push(record);
      }
    });

    return res.json({
      success: true,
      message: "Products fetched successfully",
      data: finalResponse,
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
    abortEarly: true,
  });

  if (error) {
    return res.status(500).json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    //find all to getall the colors, in the array.

    let devices = await model.DeviceInventories.findAll({
      include: [
        { model: model.DeviceImageInventories },
        { model: model.DeviceColorMasters },
        { model: model.DevicePatternMasters },
        { model: model.MaterialTypeMasters },
      ],
    });

    if (!devices || devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Error fetching product",
      });
    }

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

    if (!productDetail) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
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
          device.DeviceColorMaster && color.push(device.DeviceColorMaster.name);
          const check = material.some(
            (materialName) =>
              materialName.material === device.MaterialTypeMaster.name
          );
          if (!check) {
            console.log(device.MaterialTypeMaster.name);

            device.MaterialTypeMaster &&
              material.push({
                material: device.MaterialTypeMaster.name,
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
      message: "Product Details",
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
        primaryImage: imageUrls[0] || null,
        secondaryImage: imageUrls[1] || null,
        colors: color,
        patterns: pattern,
        material: material,
      },
    });
  } catch (error) {
    logger.error(error, "from the getProductDetails method");
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// async function getProductDetailsLatest(req, res) {
//   const { productId } = req.body;

//   const { error } = getProductId.validate(req.body, {
//     abortEarly: true,
//   });

//   if (error) {
//     return res.status(500).json({
//       success: false,
//       data: {
//         error: error.details,
//       },
//     });
//   }

//   const deviceType = await model.DeviceInventories.findOne({
//     where: { productId: productId },
//   });
// console.log(deviceType,"/");

//   const devices = await model.DeviceInventories.findAll({
//     where: {
//       deviceTypeId: deviceType?.deviceTypeId,
//     },
//     include: [
//       {
//         model: model.DeviceColorMasters,
//         attributes: ['name', 'colorCode'],
//       },
//       {
//         model: model.DeviceImageInventories,
//         attributes: ['imageKey', 'deviceId'],
//       },
//       {
//         model: model.DevicePatternMasters,
//       },
//       {
//         model: model.MaterialTypeMasters,
//         attributes: ['name', 'id'],
//       },
//     ],
//   });

//   if (!devices || devices.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: 'No devices found for this type',
//     });
//   }

//   // Find the primary device for the requested productId
//   const primaryImage = devices.find((e) => e.productId === productId);

//   if (!primaryImage) {
//     return res.status(404).json({
//       success: false,
//       message: 'Primary device not found',
//     });
//   }

//   const colors = [];
//   const patterns = [];
//   const material = [];

//   const materialSet = new Set();
//   const patternSet = new Set();

//   await Promise.all(
//     devices?.map(async (device) => {
//       const productId = device?.productId;
//       const imageKey = device?.DeviceImageInventories?.[0]?.imageKey;
//       const imageUrl = imageKey ? await generateSignedUrl(imageKey) : null;

//       // Color
//       const colorName = device?.DeviceColorMaster?.name;
//       const colorCode = device?.DeviceColorMaster?.colorCode;
//       if (colorName && colorCode) {
//         colors.push({
//           productId,
//           colorCode,
//           colorName,
//           imageUrl,
//         });
//       }

//       // Material
//       const materialName = device?.MaterialTypeMaster?.name;
//       if (materialName && !materialSet.has(materialName)) {
//         materialSet.add(materialName);
//         material.push({
//           productId,
//           materialName,
//           imageUrl,
//         });
//       }

//       // Pattern
//       const patternName = device?.DevicePatternMaster?.name;
//       if (patternName && !patternSet.has(patternName)) {
//         patternSet.add(patternName);
//         patterns.push({
//           productId,
//           patternName,
//           imageUrl,
//         });
//       }
//     })
//   );

//   // Clean primary image object and add its image URL
//   const {
//     // DeviceColorMaster,
//     DeviceImageInventories,
//     // DevicePatternMaster,
//     // MaterialTypeMaster,
//     ...cleanedPrimaryImage
//   } = primaryImage.toJSON();

//   const primaryImageKey = DeviceImageInventories?.[0]?.imageKey;
//   const primaryImageUrl = primaryImageKey
//     ? await generateSignedUrl(primaryImageKey)
//     : null;

//   const discountprice = cleanedPrimaryImage?.price * cleanedPrimaryImage?.discountAmount/100

//   cleanedPrimaryImage.imageUrl = primaryImageUrl;

//   const data = {
//     productDetail: cleanedPrimaryImage,
//     color: colors,
//     material: material,
//     patterns: patterns,
//   };

//   return res.status(200).json({
//     status: 200,
//     data: data,
//   });
// }

async function getProductDetailsLatest(req, res) {
  const { productId } = req.body;

  const { error } = getProductId.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    return res.status(500).json({
      success: false,
       message: "Product Id is missing",
      data: {
        error: error.details,
      },
    });
  }
  const patterns = [];
  const colors = [];
  const materials = [];
  // getting Current Product detail
  const getProductDetails = await model.DeviceInventories.findOne({
    where: { productId: productId },
    attributes: [
      "productId",
      "name",
      "shortDescription",
      "deviceDescription",
      ["price", "originalPrice"],
      "discountPercentage",
      "deviceTypeId",
      "patternId",
      "colorId",
      "materialTypeId",
      "productDetails",
      [sequelize.col("DevicePatternMaster.name"), "pattern"],
      [sequelize.col("DeviceColorMaster.name"), "color"],
      [sequelize.col("DeviceColorMaster.colorCode"), "colorCode"],
      [sequelize.col("MaterialTypeMaster.name"), "material"],
    ],
    include: [
      {
        model: model.DeviceTypeMasters,
        attributes: [],
      },
      {
        model: model.DevicePatternMasters,
        attributes: [],
      },
      {
        model: model.DeviceColorMasters,
        attributes: [],
      },
      {
        model: model.MaterialTypeMasters,
        attributes: [],
      },
      {
        model: model.DeviceImageInventories,
        attributes: ["id", ["imageKey", "imageUrl"]],
      },
    ],
  });
  const productDetail = getProductDetails.get({ plain: true });
  const imageArray = [];
  for (const image of productDetail.DeviceImageInventories) {
    const signedUrl = await generateSignedUrl(image.imageUrl);
    imageArray.push({
      ...image,
      imageUrl: signedUrl,
    });
  }

  productDetail["DeviceImageInventories"] = imageArray;

  const getPatternDetails = await model.DevicePatternMasters.findAll({
    attributes: [
      ["name", "patternName"],
      [sequelize.col("DeviceInventories.productId"), "productId"],
      [
        sequelize.col("DeviceInventories->DeviceImageInventories.imageKey"),
        "imageUrl",
      ],
    ],
    include: [
      {
        model: model.DeviceInventories,
        attributes: [],
        where: {
          materialTypeId: getProductDetails?.materialTypeId,
          deviceTypeId: getProductDetails?.deviceTypeId,
        },
        include: {
          model: model.DeviceImageInventories,
          attributes: [],
        },
      },
    ],
  });

  for (const pattern of getPatternDetails) {
    const plainPattern = pattern.get({ plain: true });
    const signedUrl = await generateSignedUrl(plainPattern.imageUrl);
    patterns.push({
      ...plainPattern,
      imageUrl: signedUrl,
    });
  }
  const getColorDetails = await model.DeviceColorMasters.findAll({
    attributes: [
      ["name", "colorName"],
      "colorCode",
      [sequelize.col("DeviceInventories.productId"), "productId"],
      [
        sequelize.col("DeviceInventories->DeviceImageInventories.imageKey"),
        "imageUrl",
      ],
    ],
    include: [
      {
        model: model.DeviceInventories,
        attributes: [],
        where: {
          materialTypeId: getProductDetails?.materialTypeId,
          deviceTypeId: getProductDetails?.deviceTypeId,
        },
        include: {
          model: model.DeviceImageInventories,
          attributes: [],
        },
      },
    ],
  });
  for (const color of getColorDetails) {
    const plainColor = color.get({ plain: true });
    const signedUrl = await generateSignedUrl(plainColor.imageUrl);
    colors.push({
      ...plainColor,
      imageUrl: signedUrl,
    });
  }

  const getMaterialDetails = await model.MaterialTypeMasters.findAll({
    attributes: [
      ["name", "materialName"],
      [sequelize.col("DeviceInventories.productId"), "productId"],
      [
        sequelize.col("DeviceInventories->DeviceImageInventories.imageKey"),
        "imageUrl",
      ],
    ],
    include: [
      {
        model: model.DeviceInventories,
        attributes: [],
        where: {
          deviceTypeId: getProductDetails?.deviceTypeId,
        },
        include: {
          model: model.DeviceImageInventories,
          attributes: [],
        },
      },
    ],
  });
  for (const material of getMaterialDetails) {
    const plainMaterial = material.get({ plain: true });
    const signedUrl = await generateSignedUrl(plainMaterial.imageUrl);
    materials.push({
      ...plainMaterial,
      imageUrl: signedUrl,
    });
  }

  if (!getProductDetails) {
    return res.status(404).json({
      success: false,
      message: "Product Not Found.",
    });
  }

  const originalPrice = parseFloat(productDetail?.originalPrice || 0);
const discountPercent = parseFloat(productDetail?.discount || 0);

const discountAmount = (originalPrice * discountPercent) / 100;
const sellingPrice = originalPrice - discountAmount;

productDetail.sellingPrice = sellingPrice;
  res.json({
    success: true,
    message: "Product Details fetched successfully",
    data: {
     
        colors,
        patterns,
        materials,
        productDetail: productDetail,
      },
  });
}

//#region - adding to cart in one shot
// async function addToCart(req, res) {
//   const userId = req.user.id;
//   const { products } = req.body;

//   const { error } = addToCartSchema.validate(
//     { products },
//     { abortEarly: false }
//   );

//   if (error) {
//     return res.status(400).json({
//       success: false,
//       data: { error: error.details },
//     });
//   }

//   const productIds = products.map((item) => item.productId);

//   try {
//     const productDetails = await model.DeviceInventories.findAll({
//       where: { productId: { [Op.in]: productIds } },
//       include: [
//         { model: model.DeviceColorMasters },
//         { model: model.DeviceTypeMasters },
//         { model: model.DevicePatternMasters },
//       ],
//     });

//     if (productDetails.length !== products.length) {
//       return res.status(404).json({
//         success: false,
//         message: "One or more products not found.",
//       });
//     }

//     const transaction = await sequelize.transaction();

//     try {
//       const cartItems = products.map((item) => {
//         const product = productDetails.find(
//           (p) => p.productId === item.productId
//         );

//         if (!product || !product.DeviceTypeMaster?.name) {
//           throw new Error(
//             `Product not found or missing type: ${item.productId}`
//           );
//         }

//         return {
//           customerId: userId,
//           productUUId: item.productId,
//           quantity: item.quantity,
//           productPrice: product.price,
//           productType: product.DeviceTypeMaster.name,
//           productColor:
//             product.DeviceColorMaster?.name ||
//             product.DevicePatternMaster?.name,
//           productStatus: false,
//           nameCustomNameOnCard: item.customName,
//           fontId: item.fontId,
//         };
//       });

//       const createdCartItems = await model.Cart.bulkCreate(cartItems, {
//         transaction,
//       });

//       await transaction.commit();

//       return res.json({
//         success: true,
//         data: {
//           cartIds: createdCartItems.map((item) => item.id),
//           message: "Cart updated successfully",
//         },
//       });
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   } catch (error) {
//     console.log(error);
//     logger.error(error, "from addToCart function");
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while adding items to the cart.",
//     });
//   }
// }
//#endregion

//#region - adding to cart old logic
// async function addToCart(req, res) {
//   try {
//     const userId = req.user.id;
//     const { productId, fontId, customName, quantity } = req.body;

//     const { error } = addToCartSchema.validate(req.body, {
//       abortEarly: false,
//     });

//     if (error) {
//       return res.status(500).json({
//         success: false,
//         data: {
//           error: error.details,
//         },
//       });
//     }

//     const getProductDetails = await model.DeviceInventories.findOne({
//       where: {
//         productId: productId,
//       },
//       include: [
//         {
//           model: model.DeviceColorMasters,
//         },
//         {
//           model: model.DeviceTypeMasters,
//         },
//         {
//           model: model.DevicePatternMasters,
//         },
//       ],
//     });

//     if (!getProductDetails || !getProductDetails?.DeviceTypeMaster?.name) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       })
//     }

//     let totalQuantity = Number(quantity);
//     const findCartItem = await model.Cart.findAll({
//       where: {
//         customerId: userId,
//         productUUId: productId,
//         productStatus: false,
//       },
//     });

//     if (findCartItem) {
//       Promise.all(
//         findCartItem.map(async (data) => {
//           totalQuantity += data.quantity;
//           await model.Cart.update(
//             {
//               productStatus: true,
//             },
//             {
//               where: {
//                 id: data.id,
//               },
//             }
//           );
//         })
//       );
//     }

//     const createCartItem = await model.Cart.create({
//       customerId: userId,
//       productUUId: productId,
//       quantity: totalQuantity,
//       productPrice: getProductDetails.price,
//       productType: getProductDetails.DeviceTypeMaster.name,
//       productColor: getProductDetails?.DeviceColorMaster?.name
//         ? getProductDetails?.DeviceColorMaster?.name
//         : getProductDetails?.DevicePatternMaster?.name,
//       productStatus: false,
//       nameCustomNameOnCard: customName,
//       fontId: fontId,
//     });

//     if (!createCartItem) {
//       throw new Error("cannot create cart item");
//     }

//     //use if needed
//     // createOrder(
//     //   userId,
//     //   productId,
//     //   totalPrice,
//     //   discountPrice,
//     //   getProductDetails,
//     //   1,
//     //   fontId,
//     //   customName
//     // );
//     return res.json({
//       success: true,
//       data: {
//         cartId: createCartItem.id,
//         message: "Cart Updated successfully",
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     logger.error(error, "from addToCart function");
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }
//#endregion

async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { productId, fontId, customName, quantity } = req.body;

    const { error } = addToCartSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(500).json({
        success: false,
        data: {
          error: error.details,
        },
      });
    }

    const getProductDetails = await model.DeviceInventories.findOne({
      where: {
        productId: productId,
      },
      include: [
        {
          model: model.DeviceColorMasters,
        },
        {
          model: model.DeviceTypeMasters,
        },
        {
          model: model.DevicePatternMasters,
        },
      ],
    });

    if (!getProductDetails || !getProductDetails?.DeviceTypeMaster?.name) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (Number(getProductDetails.DeviceTypeMaster.id) !== 6) {
      if (customName || fontId) {
        return res.status(400).json({
          success: false,
          message: "This product does not require custom name or fontId",
        });
      }
    }

    if (Number(getProductDetails.DeviceTypeMaster.id) === 6) {
      if (!customName || !fontId) {
        return res.status(400).json({
          success: false,
          message: "FontId and CustomName are required",
        });
      }
      if (fontId) {
        const fonts = await model.CustomFontMaster.findOne({
          where: {
            id: fontId,
          },
        });

        if (!fonts) {
          return res.status(404).json({
            success: false,
            message: "FontId not found",
          });
        }
      }
    }

    const existingCartItem = await model.Cart.findOne({
      where: {
        customerId: userId,
        productId: getProductDetails.id,
        fontId: fontId || null,
        customName: customName || null,
      },
    });

    if (existingCartItem) {
      await existingCartItem.update({
        quantity: quantity,
        fontId: fontId || null,
        customName: customName || null,
        productStatus: true,
      });

      return res.json({
        success: true,
        data: {
          cartId: existingCartItem.id,
          message: "Item Added to Cart",
        },
      });
    } else {
      const newCartItem = await model.Cart.create({
        customerId: userId,
        productId: getProductDetails.id,
        quantity: Number(quantity),
        productStatus: true,
        fontId: fontId || null,
        customName: customName || null,
        productPrice: getProductDetails.price,
      });

      return res.json({
        success: true,
        data: {
          cartId: newCartItem.id,
          message: "Item Added to Cart",
        },
      });
    }
  } catch (error) {
    console.log(error);
    logger.error(error, "from addToCart function");
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

// async function createOrder(
//   userId,
//   productId,
//   totalPrice,
//   discountPrice,
//   productDetails,
//   orderStatus,
//   fontId,
//   customName
// ) {
//   try {
//     const orderStatusMaster = await model.OrderStatusMaster.findOne({
//       where: {
//         id: orderStatus,
//       },
//     });

//     const createOrder = await model.Order.create({
//       productUUId: productId,
//       customerId: userId,
//       orderStatus: orderStatusMaster.name,
//       totalPrice: totalPrice,
//       cancelledOrder: false,
//       discountPercentage: productDetails.discountPercentage,
//       discountAmount: discountPrice,
//       orderStatusId: orderStatus,
//       isLoggedIn: true,
//       fontId: fontId,
//       nameOnCard: customName,
//     });

//     if (!createOrder) {
//       throw new Error("Cannot create Order");
//     }

//     return createOrder;
//   } catch (error) {
//     console.log(error);
//     logger.error(error, "from addToCart function");
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// }

async function getCart(req, res) {
  const userId = req.user.id;
  try {
    const getCart = await model.Cart.findAll({
      where: {
        customerId: userId,
        productStatus: true,
      },
      attributes: [
        ["id", "cartId"],
        "customerId",
        "quantity",
        "productId",
        "customName",
        "fontId",
      ],
      include: [
        {
          model: model.DeviceInventories,
          attributes: {
            exclude: ["id", "availability", "createdAt", "updatedAt"],
          },
        },
      ],
    });

    if (!getCart) {
      return res.status(404).json({
        success: false,
        message: "No Cart found",
      });
    }

    await Promise.all(
      getCart.map(async (cartVal) => {
        const product = await model.DeviceInventories.findOne({
          where: {
            id: cartVal.productId,
          },
        });

        if (product) {
          cartVal.productId = product.productId;
        }
      })
    );

    return res.json({
      success: true,
      message: "Cart Details",
      data: getCart,
    });
  } catch (error) {
    logger.error(error.message);
    console.log(error);
    return res.status(500).json({
      success: false,
      data: {
        message: error.message,
      },
    });
  }
}

async function cancelCart(req, res) {
  const userId = req.user.id;
  const { cartId } = req.body;

  try {
    const { error } = cancelCartValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(500).json({
        success: false,
        data: {
          error: error.details,
        },
      });
    }
    const checkCart = await model.Cart.findOne({
      where: {
        id: cartId,
        customerId: userId,
      },
    });
    if (checkCart) {
      if (checkCart.productStatus === false) {
        return res.status(400).json({
          success: false,
          message: "Item already removed from cart",
        });
      }
      await model.Cart.update(
        {
          productStatus: false,
        },
        {
          where: {
            customerId: userId,
            id: cartId,
          },
        }
      );
      return res.json({
        success: true,
        message: "Item removed from Cart",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Invalid Cart ID",
      });
    }
  } catch (error) {
    logger.error(error + "from cancelCart function");
    return res.status(500).json({
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
            // orderId: clearCartRequest.id,
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
  const { productData, promoCode, shippingFormData } = req.body;

  const { error } = addToNonUserCartSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.json({ success: false, data: { error: error.details } });
  }

  const transaction = await sequelize.transaction();
  try {
    const productDetailsList = await Promise.all(
      productData.map((item) =>
        model.DeviceInventories.findOne({
          where: { productId: item.productId },
          include: [
            { model: model.DeviceColorMasters },
            { model: model.DeviceTypeMasters },
            { model: model.DevicePatternMasters },
          ],
          transaction,
        })
      )
    );

    if (
      productDetailsList.some(
        (product) => !product || !product?.DeviceTypeMaster?.name
      )
    ) {
      throw new Error("One or more products could not be found.");
    }

    let totalOrderPrice = 0;
    let totalDiscountAmount = 0;
    let appliedDiscountPrice = 0;
    let totalDiscountPercentage = 0;
    let totalDiscountedPrice = 0;

    const cartEntries = productData.map((item, index) => {
      const product = productDetailsList[index];

      const totalPriceBeforeDiscount = product.price * item.quantity;
      totalDiscountAmount =
        (totalPriceBeforeDiscount * product.discountPercentage) / 100;
      appliedDiscountPrice =
        totalPriceBeforeDiscount -
        (totalPriceBeforeDiscount * product.discountPercentage) / 100;

      totalOrderPrice += appliedDiscountPrice;
      totalDiscountPercentage += product.discountPercentage;
      totalDiscountedPrice += totalDiscountAmount;
      return {
        productId: item.productId,
        fontId: item.fontId || null,
        customName: item.customName || null,
        quantity: item.quantity,
        price: product.price,
        discountPercentage: product.discountPercentage,
        discountAmount: totalDiscountAmount,
        totalPrice: appliedDiscountPrice,
        totalOrderPrice: totalOrderPrice,
        totalDiscountPercentage,
        totalDiscountedPrice,
      };
    });

    const createOrder = await model.Order.create(
      {
        totalPrice: totalOrderPrice,
        orderStatus: "cart",
        orderStatusId: 1,
        cancelledOrder: false,
        email: shippingFormData.emailId,
        discountPercentage: totalDiscountPercentage,
        discountAmount: totalDiscountedPrice,
        isLoggedIn: false,
      },
      { transaction }
    );

    await Promise.all(
      cartEntries.map(async (f) => {
        await model.OrderBreakDown.create(
          {
            orderId: createOrder.id,
            productId: f.productId,
            fontId: f.fontId || null,
            nameOnCard: f.customName || null,
            originalPrice: f.price,
            discountedPrice: f.totalPrice,
            discountedAmount: f.discountAmount,
            quantity: f.quantity,
          },
          {
            transaction,
          }
        );
      })
    );
    await model.Shipping.create(
      {
        orderId: createOrder.id,
        firstName: shippingFormData.firstName,
        lastName: shippingFormData.lastName,
        phoneNumber: shippingFormData.phoneNumber,
        emailId: shippingFormData.emailId,
        flatNumber: shippingFormData.emailId,
        address: shippingFormData.address,
        city: shippingFormData.city,
        state: shippingFormData.state,
        zipcode: shippingFormData.zipcode,
        country: shippingFormData.country,
        landmark: shippingFormData.landmark,
        isShipped: false,
      },
      { transaction }
    );

    await transaction.commit();

    console.log(cartEntries, "Final Cart Data");
    return res.json({
      success: true,
      message: "Order Created Successfully",
      data: {
        order: createOrder.id,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    logger.error(error, "from addToCart function");
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding items to the cart.",
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
  getProductDetailsLatest,
};
