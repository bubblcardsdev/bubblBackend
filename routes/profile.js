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
  DuplicateProfile,
  // getProfileByMode,
  // findAllProfilesForMobile,
  findAllProfilesForMob,
  createProfileLatest,
  updateProfileLatest,
  getProfileByUid,
  deleteProfile,
  getBase64ImageFromUrlLatest
} from "../controllers/profile.js";
import { authenticateToken } from "../middleware/token.js";


const router = express.Router();


router.get("/", getProfileByDevice);
// router.get("/m", getProfileByMode);

router.post("/checkProfileName", authenticateToken, getProfileName);

router.post("/create", authenticateToken, createProfile);
 router.post("/create-profile",authenticateToken,createProfileLatest)
 router.post("/duplicate-profile",authenticateToken,DuplicateProfile)
 router.delete("/delete-profile",authenticateToken,deleteProfile)
// router.post("/createCompleteProfileBulk", createCompleteProfileBulk);

router.get("/all", authenticateToken, findAllProfiles);

router.get("/findAll", authenticateToken, findAllProfilesForMob);

router.put("/update", authenticateToken, updateProfile);
router.put("/update-profile", authenticateToken, updateProfileLatest);

router.post("/find", authenticateToken, getProfile);
router.post("/findOne", authenticateToken, getProfileOne);
router.post("/getProfileByUid", getProfileByUid);

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
router.put("/getBase64Image", getBase64ImageFromUrlLatest);

router.put("/deletebradingimage",authenticateToken, deleteBrandingImage);
router.put("/deleteqrimage", deleteQrImage);
router.put("/deleteProfileImage",authenticateToken, deleteProfileImage);
router.get("/getUserDetails", authenticateToken, getUserDetails);
router.put("/updateProfileName", authenticateToken, updateProfileName);
export default router;
