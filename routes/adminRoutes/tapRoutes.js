import express from "express";
import tapController from "../../controllers/admin/tapController.js";

const tapRouter = express.Router();
tapRouter.get("/tapCount", tapController);
export default tapRouter;
