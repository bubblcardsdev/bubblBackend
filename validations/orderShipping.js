import Joi from "joi";

const shippingDetails = Joi.object({
  orderId: Joi.number().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  emailId: Joi.string().required(),
  flatNumber: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipcode: Joi.number().required(),
  country: Joi.string().required(),
  landmark: Joi.string().allow(""),
  isShipped: Joi.boolean(),
});

export { shippingDetails };
