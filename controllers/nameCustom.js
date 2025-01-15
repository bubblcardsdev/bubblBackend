import loggers from "../config/logger.js";
import {
  nameCustomService,
  getImageByCardServices,
  getCardImageByIdServices,
  getCardsByCardType,
  nameCustomNonUserService,
} from "../services/nameCustomService.js";

async function nameCustomController(req, res) {
  const {
    name,
    quanitiy,
    deviceType,
    fontStyle,
    price,
    fontColor,
    productStatus,
    deviceImageId,
    deviceInventorId,
    deviceColor,
  } = req.body;
  const userId = req.user.id;

  console.log(
    name,
    quanitiy,
    deviceType,
    fontStyle,
    price,
    fontColor,
    productStatus,
    deviceImageId,
    deviceInventorId,
    deviceColor
  );

  // return;
  try {
    const customDetails = await nameCustomService(
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
    );
    return customDetails;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from nameCustomController function");
  }
}

async function nameCustomNonUserController(req, res) {
  const {
    name,
    quanitiy,
    deviceType,
    fontStyle,
    price,
    fontColor,
    productStatus,
    deviceInventorId,
    deviceColor,
    email
  } = req.body;

  console.log(
    name,
    quanitiy,
    deviceType,
    fontStyle,
    price,
    fontColor,
    productStatus,
    deviceInventorId,
    deviceColor,
    email
  );

  // return;
  try {
    const customDetails = await nameCustomNonUserService(
      res,
      name,
      quanitiy,
      deviceType,
      fontStyle,
      price,
      email,
      productStatus,
      deviceInventorId,
      deviceColor
    );
    return customDetails;
  } catch (e) {
    console.log(e);
    loggers.error(e + "from nameCustomNonUserController function");
  }
}

// func for get all name Custom
async function getImageByCardController(req, res) {
  try {
    const allThumbnailImages = await getImageByCardServices(res);
    return allThumbnailImages;
  } catch (error) {
    loggers.error(error + "from getImageByCardController function");
    console.log(error);
  }
}

// func for get the name Card by Id
async function getCardImageByIdController(req, res) {
  const { inventoryId } = req.body;
  try {
    const getNameCard = await getCardImageByIdServices(res, inventoryId);
    return getNameCard;
  } catch (error) {
    loggers.error(error + "from getCardImageByIdController function");
    console.log(error);
  }
}

// func for get the Cards by pattern
async function getCardImageByTypeController(req, res) {
  const { cardType } = req.body;
  try {
    const getNameCard = await getCardsByCardType(res, cardType);
    return getNameCard;
  } catch (error) {
    loggers.error(error + "from getCardImageByTypeController function");
    console.log(error);
  }
}

export {
  nameCustomController,
  getImageByCardController,
  getCardImageByIdController,
  getCardImageByTypeController,
  nameCustomNonUserController,
};
