import express from "express";
import userRouter from "./userRoutes.js";
// import deviceRouter from "./deviceRoutes.js";
import orderRouter from "./orderRoutes.js";
import tapRouter from "./tapRoutes.js";
import revenueRouter from "./revenueRoutes.js";
import PlanRouter from "./planRouter.js";
import profileRouter from "./profileRoutes.js";
import deviceRouter from "./deviceRouter.js";
import devicePriceRouter from "./devicePriceRouter.js";
import adminRouterFunc from "./adminRoutes.js";
import contactUsRouter from "./contactusRoutes.js";
import loginRouter from "./loginRoutes.js";

const adminRouter = express.Router();

adminRouter.use("/users", userRouter);
adminRouter.use("/device", deviceRouter);
adminRouter.use("/", orderRouter);
adminRouter.use("/tap", tapRouter);
adminRouter.use("/revenue", revenueRouter);
adminRouter.use("/plan", PlanRouter);
adminRouter.use("/profiles", profileRouter);
adminRouter.use("/price", devicePriceRouter);
adminRouter.use("/", adminRouterFunc);
adminRouter.use("/contact", contactUsRouter);
adminRouter.use("/login", loginRouter);

export default adminRouter;
