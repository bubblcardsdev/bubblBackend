/* eslint-disable linebreak-style */
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
  createUserMobile,
  verifyAppleUser,
  createUserBulkController,
  createUserMobileIOS,
  refreshToken,
  verifyGoogleUserLatest,
  verifyFacebookUserLatest,
  verifyLinkedinUserLatest
} from "../controllers/auth.js";
import { authenticateToken } from "../middleware/token.js";
import {SSE, verifyMail, sendEmail, emailVerified, sendForgetPassword} from "../helper/socket_server.js";

const router = express.Router();

router.get("/events",SSE);
router.post("/sendEmail",sendEmail);
router.post("/sendForgetPasswordEmail",sendForgetPassword);
router.get("/verify",verifyMail);
router.get("/email-verified",emailVerified);
router.post("/token", issueNewToken);
router.post("/register", createUser);
router.post("/registerMobile", createUserMobile);
router.post("/registerMobileIos", createUserMobileIOS);
router.post("/verifygoogleuser", verifyGoogleUser);
router.post("/verifygoogleuserlatest", verifyGoogleUserLatest);
router.post("/verifyfacebookuser", verifyFacebookUserLatest);
router.post("/verifylinkedinuserLatest", verifyLinkedinUserLatest);
router.post("/verifyfacebookuser", verifyFacebookUser);
router.post("/verifylinkedinuser", verifyLinkedinUser);
router.post("/verifyappleuser", verifyAppleUser);
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
router.post("/refresh/token",refreshToken)



export default router;
