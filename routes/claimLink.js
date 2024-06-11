import express from "express";
import { updateClaimLink, getClaimLinkName } from "../controllers/claimlink.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.put("/name",  updateClaimLink);
router.post("/getname", getClaimLinkName);

export default router;
