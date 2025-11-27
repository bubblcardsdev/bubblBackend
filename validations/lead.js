import Joi from "joi";

const createLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  emailId: Joi.string().email().required(),
  mobileNumber: Joi.string().required(),
  where_you_met: Joi.string().min(2).max(100).required(),
  location: Joi.string().allow("", null),
  company: Joi.string().allow("", null),
});


 const updateLeadSchema = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().min(2).max(100).required(),
  emailId: Joi.string().email().required(),
  mobileNumber: Joi.string().required(),
  where_you_met: Joi.string().min(2).max(100).required(),
  location: Joi.string().allow("", null),
  company: Joi.string().allow("", null),
});



export {createLeadSchema,updateLeadSchema}