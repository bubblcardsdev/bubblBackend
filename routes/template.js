import express from "express";


import {
  findAllTemplate,
  switchTemplate,
  selectTemplate,
} from "../controllers/template.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.get("/all", findAllTemplate);
router.put("/select", authenticateToken, selectTemplate);
router.put("/change", authenticateToken, switchTemplate);

export default router;
