import express from "express";
import {
  contactUsController,
  updateContactController,
} from "../../controllers/admin/contactController.js";

const contactUsRouter = express.Router();

contactUsRouter.get("/contactUs", contactUsController);
contactUsRouter.put("/updateContact", updateContactController);
export default contactUsRouter;
