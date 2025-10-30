import Joi from "joi";

const profileImageUploadSchema = Joi.object({
  profileId: Joi.number().required(),
});

const profileImageUploadSchemaLatest = Joi.object({
  profileId: Joi.number().optional(),
});

const brandingLogoUploadSchema = Joi.object({
 profileId: Joi.number().optional(),
});

const qrCodeImageUploadSchema = Joi.object({
  profileId: Joi.number().required(),
});

export {
  profileImageUploadSchema,
  brandingLogoUploadSchema,
  qrCodeImageUploadSchema,
  profileImageUploadSchemaLatest
};
