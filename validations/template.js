import Joi from "joi";

const template = Joi.object({
  templateId: Joi.number().allow(null),
  deviceId: Joi.number().allow(""),
  templateNameId: Joi.string(),
  profileId: Joi.number().allow(""),
});

export { template };
