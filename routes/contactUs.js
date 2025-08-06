import express from "express";
import { contactUs, NewsLetter, supportForm } from "../controllers/contactUs.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.post("/", contactUs);
router.post("/newsletter", NewsLetter);
router.post("/supportForm",authenticateToken,supportForm)

export default router;
