import express from "express";
import {
  createProfile,
  getProfileByDevice,
  updateProfile,
  findAllProfiles,
  getProfile,
  changeProfile,
  phoneNumberDelete,
  emailDelete,
  websiteDelete,
  deleteSocialMedia,
  deleteDigitalPayment,
  findSocialMediaId,
  getProfileImage,
  getProfileImageForLeadGen,
  getBase64ImageFromUrl,
  deleteBrandingImage,
  deleteQrImage,
  deleteProfileImage,
  getUserDetails,
  getProfileName,
  updateProfileName,
  createCompleteProfileBulk,
  getProfileOne,
  // getProfileByMode,
  // findAllProfilesForMobile,
  findAllProfilesForMob
} from "../controllers/profile.js";
import { authenticateToken } from "../middleware/token.js";

const router = express.Router();

router.post("/checkProfileName", authenticateToken, getProfileName);

router.post("/create", authenticateToken, createProfile);
// router.post("/createCompleteProfileBulk", createCompleteProfileBulk);

router.get("/all", authenticateToken, findAllProfiles);

router.get("/findAll", authenticateToken, findAllProfilesForMob);
router.get("/", getProfileByDevice);
// router.get("/m", getProfileByMode);
router.put("/update", authenticateToken, updateProfile);
router.post("/find", authenticateToken, getProfile);
router.post("/findOne", authenticateToken, getProfileOne);
// router.get("/one", authenticateToken, getProfileOne);
router.put("/changeProfile", authenticateToken, changeProfile);
router.put("/deletephone", authenticateToken, phoneNumberDelete);
router.put("/deleteemail", authenticateToken, emailDelete);
router.put("/deletewebsite", authenticateToken, websiteDelete);
router.put("/deletesocial", authenticateToken, deleteSocialMedia);
router.put("/deletedigitalpayment", authenticateToken, deleteDigitalPayment);
router.get("/allsocial", authenticateToken, findSocialMediaId);
router.post("/getProfileImage", getProfileImage);
router.post("/getProfileImageForLeadGen", getProfileImageForLeadGen);
router.put("/getBase64Image", getBase64ImageFromUrl);

router.put("/deletebradingimage", deleteBrandingImage);
router.put("/deleteqrimage", deleteQrImage);
router.put("/deleteProfileImage", deleteProfileImage);
router.get("/getUserDetails", authenticateToken, getUserDetails);
router.put("/updateProfileName", authenticateToken, updateProfileName);
export default router;
