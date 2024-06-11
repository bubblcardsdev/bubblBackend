import Joi from "joi";

const profileImageUploadSchema = Joi.object({
  profileId: Joi.number().required(),
});

const brandingLogoUploadSchema = Joi.object({
  profileId: Joi.number().required(),
});

const qrCodeImageUploadSchema = Joi.object({
  profileId: Joi.number().required(),
});

export {
  profileImageUploadSchema,
  brandingLogoUploadSchema,
  qrCodeImageUploadSchema,
};
