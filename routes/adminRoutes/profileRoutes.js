import express from "express";
import ProfileController from "../../controllers/admin/profileController.js";

const profileRouter = express.Router();
profileRouter.get("/allProfiles", ProfileController);

export default profileRouter;
