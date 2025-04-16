import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  isMobile: Joi.boolean()
});

const createUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  deviceID: Joi.string().default(""),
});

const createMobileUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().allow(""),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  deviceID: Joi.string().default(""),
  templateId: Joi.number().required(),
  modeId: Joi.number().required(),
  companyName: Joi.string().required().allow(""),
  phoneNumber: Joi.string().required(),
  countryCode: Joi.string().required(),
  profileName: Joi.string().required(),
  designation:Joi.string().required().allow("")
});

const verifyGoogleUserSchema = Joi.object({
  credential: Joi.string().required(),
  isMobile: Joi.boolean()
});

const verifyFacebookUserSchema = Joi.object({
  accesstoken: Joi.string().required(),
  isMobile: Joi.boolean()
});

const verifyLinkedinUserSchema = Joi.object({
  authorizationCode: Joi.string().required(),
  isMobile: Joi.boolean()
});
const verifyLinkedinUserSchemaMobile = Joi.object({
  family_name: Joi.string().required(),
  given_name: Joi.string().required(),
  Email: Joi.string().required(),
  isMobile: Joi.boolean()
});


const updateUserSchema = Joi.object({
  userImage: Joi.string(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  phoneNumber: Joi.string(),
  DOB: Joi.string().allow(""),
  gender: Joi.string().allow(""),
  country: Joi.string().allow(""),
});

const addPhoneNumberSchema = Joi.object({
  email: Joi.string().email().required(),
  countryCode: Joi.string().required(),
  phoneNumber: Joi.string().required(),
});

const resendOtpSchema = Joi.object({
  countryCode: Joi.string().required(),
  phoneNumber: Joi.string().required(),
});

const resendMailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyOtpSchema = Joi.object({
  countryCode: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  otp: Joi.string().required(),
});
const sendMailSchema = Joi.object({
  email: Joi.string().email().required()
});
const verifyEmailSchema = Joi.object({
  emailVerificationId: Joi.string().required(),
  email: Joi.string().required(),
});

const verifyEmailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const changePasswordSchema = Joi.object({
  forgotPasswordId: Joi.string().required(),
  newPassword: Joi.string().required(),
});

const freeCardDesignSchema = Joi.object({
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  name: Joi.string().required(),
});

export {
  loginSchema,
  createUserSchema,
  verifyGoogleUserSchema,
  verifyFacebookUserSchema,
  verifyLinkedinUserSchema,
  updateUserSchema,
  addPhoneNumberSchema,
  resendOtpSchema,
  resendMailOtpSchema,
  verifyOtpSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  verifyEmailOtpSchema,
  createMobileUserSchema,
  verifyLinkedinUserSchemaMobile,
  sendMailSchema,
  freeCardDesignSchema
};
