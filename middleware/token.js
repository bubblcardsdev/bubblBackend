/* eslint-disable no-useless-catch */
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import model from "../models/index.js";

const generateToken = function (user, secret, expiration) {
  return jwt.sign(user, secret, {
    expiresIn: expiration,
  });
};

const generateAccessToken = (user) =>
  generateToken(user, config.accessSecret, config.accessTokenExpiration);

const generateRefreshToken = (user) =>
  generateToken(user, config.refreshSecret, config.refreshTokenExpiration);

const issueToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.refreshSecret);
    const { id, firstName, lastName, email, phoneNumber } = decoded;
    const user = {
      id,
      firstName,
      lastName,
      email,
      phoneNumber,
    };

    return generateAccessToken(user);
  } catch (error) {
    throw error;
  }
};

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const { exp } = jwt.decode(token);
      if (exp * 1000 < Date.now()) {
        return res.status(401).json({
          success: false,
          data: {
            message: "Token has expired",
          },
        });
      }
      const decoded = jwt.verify(token, config.accessSecret);
      const { id, firstName, lastName, email } = decoded;
      const user = {
        id,
        firstName,
        lastName,
        email,
      };
      const getUser = await model.User.findOne({ where: { id: id } });

      if (!getUser) {
        return res.status(401).json({
          success: false,
          data: {
            message: "User not found",
          },
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.json({
        success: false,
        data: {
          error,
        },
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      data: {
        message: "authorization not provided",
      },
    });
  }
};

const authenticateCheckoutToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    req.email = {};
    return next();
  }
  if (token) {
    try {
      const { exp } = jwt.decode(token);
      if (exp * 1000 < Date.now()) {
        return res.status(401).json({
          success: false,
          data: {
            message: "Token has expired",
          },
        });
      }
      const decoded = jwt.verify(token, config.accessSecret);
      const { id, firstName, lastName, email } = decoded;
      const user = {
        id,
        firstName,
        lastName,
        email,
      };

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: {
          message: error.message,
        },
      });
    }
  }
};

const generateAppleClientSecret = () =>{
  const alg = {
     algorithm: 'ES256',
    keyid:config.appleKeyId,
  }

  const token = jwt.sign({
    iss:config.appleTeamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 180,
    aud: 'https://appleid.apple.com',
    sub:config.appleClientId
  },config.applePrivateKey)

  return token;
}

export {
  generateAccessToken,
  generateRefreshToken,
  generateAppleClientSecret,
  issueToken,
  authenticateToken,
  authenticateCheckoutToken,
};
