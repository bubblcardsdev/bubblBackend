import express from "express";
import {
  login,
  createUser,
  verifyGoogleUser,
  verifyFacebookUser,
  verifyLinkedinUser,
  addPhoneNumber,
  updateUser,
  verifyOtp,
  verifyEmail,
  issueNewToken,
  forgotPassword,
  changePassword,
  resendOtp,
  resetPassword,
  verifyEmailOtp,
  resendMailOtp,
  createUserBulkController,
} from "../controllers/auth.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.post("/token", issueNewToken);
router.post("/register", createUser);
router.post("/registerBulk", createUserBulkController);
router.post("/verifygoogleuser", verifyGoogleUser);
router.post("/verifyfacebookuser", verifyFacebookUser);
router.post("/verifylinkedinuser", verifyLinkedinUser);
router.post("/addphonenumber", addPhoneNumber);
router.post("/resendotp", resendOtp);
router.post("/resendMailotp", resendMailOtp);
router.post("/verifyotp", verifyOtp);
router.post("/verifyemail", verifyEmail);
router.post("/verifyemailOtp", verifyEmailOtp);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.post("/changepassword", changePassword);
router.put("/updateuser", authenticateToken, updateUser);
router.put("/reset", authenticateToken, resetPassword);

export default router;
