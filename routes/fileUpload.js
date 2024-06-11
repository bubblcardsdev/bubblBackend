import express from "express";
import {
  profileImageUpload,
  brandingLogoUpload,
  qrCodeImageUpload,
  userImageUpload,
} from "../controllers/fileUpload.js";
import { upload } from "../middleware/fileUpload.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

// Posting Two image
router.post(
  "/profileimage",
  authenticateToken,
  upload.fields([
    { name: "squareImage", maxCount: 1 },
    { name: "rectangleImage", maxCount: 1 },
  ]),
  profileImageUpload
);

router.post(
  "/brandinglogo",
  authenticateToken,
  upload.single("brandingLogo"),
  brandingLogoUpload
);

router.post(
  "/qrcodeimage",
  authenticateToken,
  upload.single("qrCodeImage"),
  qrCodeImageUpload
);
router.post(
  "/userimage",
  authenticateToken,
  upload.single("userImage"),
  userImageUpload
);

export default router;
