import express from "express";
import { contactUs, NewsLetter } from "../controllers/contactUs.js";

const router = express.Router();

router.post("/", contactUs);
router.post("/newsletter", NewsLetter);

export default router;
