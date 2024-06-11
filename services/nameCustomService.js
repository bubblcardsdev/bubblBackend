import model from "../models/index.js";
import user from "../models/user.cjs";
import nodeHtmlToImage from "node-html-to-image";
import * as fs from "fs";
import htmlImageConversion from "../controllers/htmlImage.js";
import { generateSignedUrl, upload } from "../middleware/fileUpload.js";
import { uploadFileToS3 } from "../middleware/fileUpload.js";
import { sendMail } from "../middleware/email.js";

async function nameCustomService(
  res,
  req,
  name,
  quanitiy,
  deviceType,
  fontStyle,
  fontColor,
  price,
  userId,
  productStatus,
  deviceImageId,
  deviceInventorId,
  deviceColor
) {
  const directory = "pdf";
  const filename = "review.pdf";

  // Construct the file path dynamically
  // const filePath = `.\${directory}\${filename}`;
  const filePath = "./services/pdf/review.pdf";
  // const filePath = "./pdf/review.pdf";

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
    const val = await model.Order.create({
      customerId: userId,
      totalPrice: price,
      orderStatus: "cart",
    });
  }

  let getOrder = await model.Order.findOne({
    where: {
      customerId: userId,
      orderStatus: "cart",
    },
  });
  const OrderId = getOrder.id;

  // const pdfValue = await htmlImageConversion(name, userId, OrderId);
  uploadFileToS3(res, userId, filePath);

  const product = await model.NameDeviceImageInventory.findOne({
    where: {
      id: deviceInventorId,
    },
  });

  const productCost = product.price * quanitiy;

  // if (checkCart === null) {
  await model.Cart.create({
    productType: deviceType,
    customerId: userId,
    orderId: getOrder.id,
    quantity: quanitiy,
    productColor: deviceColor,
    productPrice: productCost,
    productStatus: true,
  });

  const createName = await model.CustomCards.create({
    customName: name,
    quantity: quanitiy,
    fontStyle: fontStyle,
    productType: deviceType,
    productPrice: productCost,
    // productColor: fontColor,
    productColor: deviceColor,
    userId: userId,
    orderId: getOrder.id,
    productStatus: productStatus,
    deviceInventorId: deviceInventorId,
  });
   const getCartPrice = await model.Cart.sum("productPrice", {
      where: { orderId: getOrder.id, productStatus: true },
    });

  await model.Order.update(
    {
      totalPrice: getCartPrice,
    },
    {
      where: {
        id: getOrder.id,
      },
    }
  );

  return res.json({
    success: true,
    createName,
    data: {
      message: "Cart Updated successfully",
    },
  });
}

// service file for get all the name custom details
async function getImageByCardServices(res) {
  let devices = await model.NameCustomImages.findAll({});

  devices = await Promise.all(
    devices.map(async (device) => {
      console.log(device, "device device device");
      let deviceImage = await generateSignedUrl(device.imageUrl);
      return {
        id: device.id,
        deviceInventorId: device.NameCustomDeviceId,
        deviceThumbnailImageUrl: deviceImage,
        fontColor: device.fontColor,
      };
    })
  );
  return res.json({
    success: true,
    devices,
  });
}

// service file for get name By Id
async function getCardImageByIdServices(res, inventoryId) {
  const checkImageId = await model.DeviceInventory.findOne({
    where: {
      id: inventoryId,
    },
  });
  let getDeviceId = "";
  let deviceImage = "";
  if (checkImageId) {
    let getImageById = await model.DeviceInventory.findOne({
      where: {
        id: inventoryId,
      },
    });
    deviceImage = await generateSignedUrl(getImageById.deviceImage);
    getDeviceId = getImageById.id;

    return res.json({
      success: true,
      deviceImage,
      getDeviceId,
    });
  } else {
    return res.json({
      success: false,
      message: "Device not found",
    });
  }
}

// async function getCardsByCardType(res, cardType) {
//   let getAllImages = await model.DeviceInventory.findAll({
//     where: {
//       deviceType: cardType,
//     },
//     include: {
//       model: model.DeviceThumbnailImage,
//     },
//   });

//   getAllImages = await Promise.all(
//     getAllImages.map(async (device) => {
// let deviceImage = await generateSignedUrl(
//   device.DeviceImageInventories[0].deviceThumbnailImageUrl
// );
//       return {
//         id: device.id,
//         deviceType: device.deviceType,
//         deviceColor: device.deviceColor,
//         price: device.price,
//         DeviceImageInventories: [
//           {
//             id: device.DeviceImageInventories[0].id,
//             deviceInventorId: device.DeviceImageInventories[0].deviceInventorId,
//             deviceThumbnailImageUrl: deviceImage,
//           },
//         ],
//       };
//     })
//   );
//   return res.json({
//     success: true,
//     getAllImages,
//   });
// }

async function getCardsByCardType(res, cardType) {
  let getCardTypeDevice = await model.NameDeviceImageInventory.findAll({
    where: {
      deviceType: cardType,
    },
    include: [
      {
        model: model.NameCustomImages,
      },
    ],
  });
  // let deviceImg = "";

  // getCardTypeDevice.map((cardType) => {
  //   cardType.NameCustomImages.map(async (device) => {
  //     deviceImg = await generateSignedUrl(device.imageUrl);
  //     return deviceImg;
  //   });
  // });

  for (const cardType of getCardTypeDevice) {
    for (const device of cardType.NameCustomImages) {
      device.imageUrl = await generateSignedUrl(device.imageUrl);
    }
  }

  return res.json({
    success: true,
    getCardTypeDevice,
  });
}

async function NameCustomConfirmationEmail(userId) {
  const getUserMailId = await model.User.findOne({
    where: {
      id: userId,
    },
  });

  const email = getUserMailId.email;
  const subject = "Name Confirmation email";
  const html = `It is Name Confirmation Mail`;
  await sendMail(email, subject, html);
}
export {
  nameCustomService,
  getImageByCardServices,
  getCardImageByIdServices,
  NameCustomConfirmationEmail,
  getCardsByCardType,
};
