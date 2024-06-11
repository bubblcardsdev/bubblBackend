import { generateAccessToken } from "../middleware/token.js";
import model from "../models/index.js";
import logger from "../config/logger.js";

async function loginServices(email, password) {
  try {
    const findUser = await model.Admin.findOne({
      where: {
        email: email,
      },
    });
    if (findUser) {
      if (password === findUser.password) {
        const email = findUser.email;
        const user = {
          email,
        };
        const jwtToken = generateAccessToken(user);
        return {
          message: "success",
          data: {
            token: jwtToken.toString(),
          },
        };
      } else {
        return {
          message: "failure",
          data: {
            token: "Invlaid Credentials",
          },
        };
      }
    } else {
      return {
        message: "failure",
        data: {
          token: "Invlaid Credentials",
        },
      };
    }
  } catch (e) {
    logger.error(e.toString());
  }
}

async function getLoginServices(res) {
  try {
    const getLogin = await model.Admin.findOne({
      where: {
        id: 1,
      },
    });
    return res.json(getLogin);
    return;
  } catch (e) {
    console.log(e);
  }
}
export { loginServices, getLoginServices };
