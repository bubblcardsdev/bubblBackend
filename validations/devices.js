import Joi from "joi";

export const linkDeviceSchema = Joi.object({
  deviceUid: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.empty": "Device UID is required",
    "any.required": "Device UID is required",
    "string.guid": "Device UID must be a valid UUID (v4)",
  }),

  profileId: Joi.number().optional().allow(null).messages({
    "number.base": "Profile ID must be a number",
  }),

  uniqueName: Joi.string().optional().min(0).messages({
    "string.base": "Unique Name must be a string",
    "any.unknown": "Unique Name is only allowed when Profile ID is provided",
  }),

  deviceNickName: Joi.string().optional().messages({
    "string.base": "Device Nickname must be a string",
    "string.empty": "Device Nickname cannot be empty",
  }),
});

export const unlinkDeviceSchema = Joi.object({
  deviceUid: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.empty": "Device UID is required",
    "any.required": "Device UID is required",
    "string.guid": "Device UID must be a valid UUID (v4)",
  }),
  accountDeviceLinkId: Joi.number().required().messages({
    "number.base": "Account Device Link ID must be a number",
    "any.required": "Account Device Link ID is required",
  }),
});

export const switchProfileSchema = Joi.object({
  accountDeviceLinkId: Joi.number().required().messages({
    "number.base": "Account Device Link ID must be a number",
    "any.required": "Account Device Link ID is required",
  }),
  profileId: Joi.number().required().messages({
    "number.base": "Profile ID must be a number",
    "any.required": "Profile ID is required",
  }),
});

export const switchModeSchema = Joi.object({
  accountDeviceLinkId: Joi.number().required().messages({
    "number.base": "Account Device Link ID must be a number",
    "any.required": "Account Device Link ID is required",
  }),

  deviceLinkId: Joi.number().required().messages({
    "number.base": "Device Link ID must be a number",
    "any.required": "Device Link ID is required",
  }),

  modeId: Joi.number().valid(2, 3).required().messages({
    "number.base": "Mode ID must be a number",
    "any.only": "Mode ID must be either 2 or 3",
    "any.required": "Mode ID is required",
  }),

  modeUrl: Joi.when("modeId", {
    is: 3,
    then: Joi.string().required().messages({
      "string.base": "Mode URL must be a string",
      "string.uri": "Mode URL must be a valid URI",
      "any.required": "Mode URL is required when Mode ID is 3",
    }),
    otherwise: Joi.valid(null).optional(), // or Joi.forbidden() if you want to disallow any value
  }),
});

export const updateUniqueNameSchema = Joi.object({
  deviceLinkId: Joi.number().required().messages({
    "number.base": "Device Link ID must be a number",
    "any.required": "Device Link ID is required",
  }),
  uniqueName: Joi.string().required().messages({
    "string.base": "Unique Name must be a string",
    "string.empty": "Unique Name cannot be empty",
    "any.required": "Unique Name is required",
  }),
});

export const updateDeviceNameSchema = Joi.object({
  accountDeviceLinkId: Joi.number().required().messages({
    "number.base": "Account Device Link ID must be a number",
    "any.required": "Account Device Link ID is required",
  }),
  deviceNickName: Joi.string().required().messages({
    "string.base": "Unique Name must be a string",
    "string.empty": "Unique Name cannot be empty",
    "any.required": "Unique Name is required",
  }),
});
