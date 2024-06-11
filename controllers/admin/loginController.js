import {
  loginServices,
  getLoginServices,
} from "../../adminServices/loginServices.js";
import logger from "../../config/logger.js";

async function loginController(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const getLoginToken = await loginServices(email, password);
    return res.json(getLoginToken);
  } catch (e) {
    console.log(e);
    logger.error(e);
  }
}

async function getLoginDetails(req, res) {
  try {
    const getLoginToken = await getLoginServices(res);
    return getLoginToken;
  } catch (e) {
    console.log(e);
    logger.error(e);
  }
}
export { loginController, getLoginDetails };
