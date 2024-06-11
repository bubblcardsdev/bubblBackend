import Joi from "joi";

const createProfileSchema = Joi.object({
  profileName: Joi.string().required(),
  accountDeviceLinkId: Joi.number().strict().allow(null),
});

const updateProfileSchema = Joi.object({
  profileId: Joi.number(),
  profileImage: Joi.string().allow(""),
  deviceLinkId: Joi.number().allow(null),
  templateId: Joi.number().allow(null).required(),
  darkMode: Joi.bool(),
  firstName: Joi.string().allow("").required(),
  lastName: Joi.string().allow("").required(),
  designation: Joi.string().allow(""),
  companyName: Joi.string().allow("").required(),
  companyAddress: Joi.string().allow(""),
  shortDescription: Joi.string().allow(""),
  address: Joi.string().allow(""),
  city: Joi.string().allow(""),
  zipCode: Joi.string().allow(""),
  state: Joi.string().allow(""),
  country: Joi.string().allow(""),
  brandingFontColor: Joi.string().allow(""),
  brandingBackGroundColor: Joi.string().allow(""),
  brandingAccentColor: Joi.string().allow(""),
  brandingFont: Joi.string().allow(""),
  phoneNumberEnable: Joi.bool(),
  emailEnable: Joi.bool(),
  websiteEnable: Joi.bool(),
  socialMediaEnable: Joi.bool(),
  digitalMediaEnable: Joi.bool(),
  phoneNumbers: Joi.array()
    .items(
      Joi.object({
        phoneNumberId: Joi.number().allow(null),
        countryCode: Joi.string().allow(""),
        phoneNumber: Joi.string().allow(""),
        phoneNumberType: Joi.string().allow(""),
        checkBoxStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      }).and(
        "phoneNumberId",
        "countryCode",
        "phoneNumber",
        "phoneNumberType",
        "checkBoxStatus",
        "activeStatus"
      )
    )
    .required(),
  emailIds: Joi.array()
    .items(
      Joi.object({
        emailIdNumber: Joi.number().allow(null),
        emailId: Joi.string().allow(""),
        emailType: Joi.string().allow(""),
        checkBoxStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      }).and(
        "emailIdNumber",
        "emailId",
        "emailType",
        "checkBoxStatus",
        "activeStatus"
      )
    )
    ,
  websites: Joi.array()
    .items(
      Joi.object({
        websiteId: Joi.number().allow(null),
        website: Joi.string().allow(""),
        websiteType: Joi.string().allow(""),
        checkBoxStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      }).and(
        "websiteId",
        "website",
        "websiteType",
        "checkBoxStatus",
        "activeStatus"
      )
    )
    ,
  socialMediaNames: Joi.array()
    .items(
      Joi.object({
        profileSocialMediaLinkId: Joi.number().allow(null),
        profileSocialMediaId: Joi.number().allow(""),
        socialMediaName: Joi.string().allow(""),
        enableStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      }).and(
        "profileSocialMediaLinkId",
        "profileSocialMediaId",
        "socialMediaName",
        "enableStatus",
        "activeStatus"
      )
    )
    ,
  digitalPaymentLinks: Joi.array()
    .items(
      Joi.object({
        profileDigitalPaymentLinkId: Joi.number().allow(null),
        profileDigitalPaymentsId: Joi.number().allow(""),
        digitalPaymentLink: Joi.string().allow(""),
        enableStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      }).and(
        "profileDigitalPaymentLinkId",
        "profileDigitalPaymentsId",
        "digitalPaymentLink",
        "enableStatus",
        "activeStatus"
      )
    )
    ,
});

export { createProfileSchema, updateProfileSchema };
