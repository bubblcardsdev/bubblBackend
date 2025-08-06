import Joi from "joi";


const supportFormSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  emailId: Joi.string().email().required(),
  phoneNumber: Joi.string().optional(),
  message:Joi.string(),
});


export {supportFormSchema}