import authorizeUser from "../controllers/RD/authorizationUser.js";
import express from "express";
const router = express.Router();

router.post("/user", authorizeUser)

export default router