import bcrypt from "bcrypt";
import config from "../config/config.js";

async function hashPassword(password) {
  return bcrypt.hashSync(password, config.saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

export { hashPassword, comparePassword };
