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

const createProfileSchemaLatest = Joi.object({
  profileName: Joi.string().required(),
  templateId: Joi.number().required(),
  darkMode: Joi.bool(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  designation: Joi.string().allow(""),
  companyName: Joi.string().allow("").optional(),
  companyAddress: Joi.string().allow("").optional(),
  shortDescription: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional(),
  city: Joi.string().allow("").optional(),
  zipCode: Joi.string().allow("").optional(),
  state: Joi.string().allow("").optional(),
  country: Joi.string().allow("").optional(),
  brandingFontColor: Joi.string().allow("").optional(),
  brandingBackGroundColor: Joi.string().allow("").optional(),
  brandingAccentColor: Joi.string().allow("").optional(),
  brandingFont: Joi.string().allow("").optional(),
  phoneNumberEnable: Joi.bool().optional(),
  emailEnable: Joi.bool().optional(),
  websiteEnable: Joi.bool().optional(),
  socialMediaEnable: Joi.bool().optional(),
  digitalMediaEnable: Joi.bool().optional(),
  phoneNumbers: Joi.array()
  .items(
    Joi.object({
      phoneNumberId: Joi.number().optional(),
      countryCode: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      phoneNumberType: Joi.string().optional(),
      checkBoxStatus: Joi.boolean().optional(),
      activeStatus: Joi.boolean().required(),
    })
  )
  .max(2)       // Maximum 2 phone number objects
  .optional(),
  emailIds: Joi.array()
  .items(
    Joi.object({
      emailIdNumber: Joi.number().optional(),
      emailId: Joi.string().email().required(),
      emailType: Joi.string().optional(),
      checkBoxStatus: Joi.boolean().optional(),
      activeStatus: Joi.boolean().required(),
    })
  )
  .max(2)
  .optional(),
  websites: Joi.array()
    .items(
      Joi.object({
        websiteId: Joi.number().optional(),
        website: Joi.string().allow(""),
        websiteType: Joi.string().allow(""),
        checkBoxStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      })
    ).max(1)
    ,
  socialMediaNames: Joi.array()
    .items(
      Joi.object({
        profileSocialMediaLinkId: Joi.number().optional(),
        profileSocialMediaId: Joi.number().required(),
        socialMediaName: Joi.string().required().min(1),
        enableStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      })
    ).unique("profileSocialMediaId")
    ,
  digitalPaymentLinks: Joi.array()
    .items(
      Joi.object({
        profileDigitalPaymentLinkId: Joi.number().optional(),
        profileDigitalPaymentsId: Joi.number().allow(""),
        digitalPaymentLink: Joi.string().allow(""), // need to implement upi id check
        enableStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      })
    ).max(3).unique("profileDigitalPaymentsId")
    ,
});

const duplicateProfileSchema = Joi.object({
    profileId:Joi.number().required(),
})


const updateProfileSchemaLatest = Joi.object({
  profileId:Joi.number().required(),
  profileName: Joi.string().required(),
  deviceLinkId: Joi.number().allow(null).optional(),
  templateId: Joi.number().required(),
  darkMode: Joi.bool(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  designation: Joi.string().allow(""),
  companyName: Joi.string().allow("").optional(),
  companyAddress: Joi.string().allow("").optional(),
  shortDescription: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional(),
  city: Joi.string().allow("").optional(),
  zipCode: Joi.string().allow("").optional(),
  state: Joi.string().allow("").optional(),
  country: Joi.string().allow("").optional(),
  brandingFontColor: Joi.string().allow("").optional(),
  brandingBackGroundColor: Joi.string().allow("").optional(),
  brandingAccentColor: Joi.string().allow("").optional(),
  brandingFont: Joi.string().allow("").optional(),
  phoneNumberEnable: Joi.bool().optional(),
  emailEnable: Joi.bool().optional(),
  websiteEnable: Joi.bool().optional(),
  socialMediaEnable: Joi.bool().optional(),
  digitalMediaEnable: Joi.bool().optional(),
  phoneNumbers: Joi.array()
  .items(
    Joi.object({
      phoneNumberId: Joi.number().optional(),
      countryCode: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      phoneNumberType: Joi.string().empty("").default("Home"),
      checkBoxStatus: Joi.boolean().optional(),
      activeStatus: Joi.boolean().required(),
    })
  )       // Maximum 2 phone number objects
  .optional(),
  emailIds: Joi.array()
  .items(
    Joi.object({
      emailIdNumber: Joi.number().optional(),
      emailId: Joi.string().email().required(),
      emailType: Joi.string().optional(),
      checkBoxStatus: Joi.boolean().optional(),
      activeStatus: Joi.boolean().required(),
    })
  )
  .optional(),
  websites: Joi.array()
    .items(
      Joi.object({
        websiteId: Joi.number().optional(),
        website: Joi.string().allow(""),
        websiteType: Joi.string().allow(""),
        checkBoxStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      })
    )
    ,
  socialMediaNames: Joi.array()
    .items(
      Joi.object({
        profileSocialMediaLinkId: Joi.number().optional(),
        profileSocialMediaId: Joi.number().required(),
        socialMediaName: Joi.string().required().allow(""),
        enableStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      })
    ).unique("profileSocialMediaId")
    ,
  digitalPaymentLinks: Joi.array()
    .items(
      Joi.object({
        profileDigitalPaymentLinkId: Joi.number().optional(),
        profileDigitalPaymentsId: Joi.number().allow(""),
        digitalPaymentLink: Joi.string().allow(""), // need to implement upi id check
        enableStatus: Joi.bool(),
        activeStatus: Joi.bool(),
      })
    ).max(3).unique("profileDigitalPaymentsId")
    ,
});








export { createProfileSchema, updateProfileSchema,createProfileSchemaLatest,updateProfileSchemaLatest,duplicateProfileSchema };
