import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  deviceID: Joi.string().default(""),
});

const verifyGoogleUserSchema = Joi.object({
  credential: Joi.string().required(),
});

const verifyFacebookUserSchema = Joi.object({
  accesstoken: Joi.string().required(),
});

const verifyLinkedinUserSchema = Joi.object({
  authorizationCode: Joi.string().required(),
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

const verifyEmailSchema = Joi.object({
  emailVerificationId: Joi.string().required(),
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
  verifyEmailOtpSchema
};
