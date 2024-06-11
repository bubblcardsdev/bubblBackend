import express from "express";
import {
  loginController,
  getLoginDetails,
} from "../../controllers/admin/loginController.js";

const loginRouter = express.Router();

// loginRouter.get("/loginDetails", loginController);
loginRouter.post("/loginAdmin", loginController);
loginRouter.get("/getLogin", getLoginDetails);

export default loginRouter;
