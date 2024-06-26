import express from "express";
import home from "../controllers/home.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/userprofile", authenticateToken, home.userProfile);

export default router;
