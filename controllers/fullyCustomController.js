import loggers from "../config/logger.js";
import {
  fullyCustomNonUserService,
  fullyCustomService,
  getPriceFromFullCustom,
} from "../services/fullyCustomService.js";

async function FullyCustomController(req, res) {

  try {
    const { quantity, price, deviceColor, deviceType } = req.body;
    const userId = req.user.id;
    const fullyCustomDetails = await fullyCustomService(
      quantity,
      price,
      userId,
      res,
      deviceColor,
      deviceType
    );
    return fullyCustomDetails;
  } catch (error) {
    console.log(error);
    loggers.error(error+"from FullyCustomController function");
  }
}

async function FullyCustomNonUserController(req, res) {

  try {
    const { quantity, price, deviceColor, deviceType,email } = req.body;
    
    const fullyCustomDetails = await fullyCustomNonUserService(
      quantity,
      price,
      email,
      res,
      deviceColor,
      deviceType
    );
    return fullyCustomDetails;
  } catch (error) {
    console.log(error);
    loggers.error(error+"from FullyCustomController function");
  }
}

async function getPriceController(req, res) {
  try {
    const fullyCustomDetails = await getPriceFromFullCustom(res);
    return fullyCustomDetails;
  } catch (error) {
    console.log(error);
    loggers.error(error+"from getPriceController function");
  }
}

export { FullyCustomController, getPriceController,FullyCustomNonUserController };
