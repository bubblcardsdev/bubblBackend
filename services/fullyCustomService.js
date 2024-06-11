import model from "../models/index.js";
import { sendMail } from "../middleware/email.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";

async function fullyCustomService(
  quantity,
  price,
  userId,
  res,
  deviceColor,
  deviceType
) {
  const checkOrder = await model.Order.findOne({
    where: {
      customerId: userId,
      orderStatus: "cart",
    },
    include: {
      model: model.Cart,
    },
  });

  // if check order null, create a order

  if (checkOrder === null) {
    const createOrder = await model.Order.create({
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

  const fullCustom = await model.DeviceInventory.findOne({
    where: {
      deviceType: deviceType,
      deviceColor: deviceColor,
    },
  });

  const productPrice = fullCustom.price * quantity;

  if (getOrder) {
    const createCart = await model.Cart.create({
      productType: deviceType,
      customerId: userId,
      orderId: getOrder.id,
      quantity: quantity,
      productColor: deviceColor,
      productPrice: productPrice,
      productStatus: true,
    });
  }

  const createFullyCustoms = await model.FullyCustom.create({
    quantity: quantity,
    productPrice: productPrice,
    userId: userId,
    orderId: getOrder.id,
    productStatus: false,
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

  if (createFullyCustoms) {
    return res.json({
      success: true,
      message: "Order Created",
    });
  }
}

async function fullyCustomMailService(orderId, userId) {
  const getUserMailId = await model.User.findOne({
    where: {
      id: userId,
    },
  });
  const subject = "Fully Order Custom";
  const emailMessage = `Hi this is one prder`;
  const email = getUserMailId.email;

  await sendMail(email, subject, emailMessage);
}

async function getPriceFromFullCustom(res) {
  const getPrice = await model.DeviceInventory.findOne({
    where: {
      deviceType: "Full Custom",
    },
  });

  let fullCustomPrice = "";
  let fullyCustomImage = await generateSignedUrl(getPrice.deviceImage);
  if (getPrice) {
    fullCustomPrice = getPrice;
    return res.json({
      success: true,
      fullCustomPrice,
      fullyCustomImage,
    });
  }
}

export { fullyCustomService, fullyCustomMailService, getPriceFromFullCustom };
