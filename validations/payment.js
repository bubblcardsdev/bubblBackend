import Joi from "joi";

const initiatePayValidation = Joi.object({
  orderId: Joi.number().required(),
  orderType: Joi.number().required().valid(1, 2).messages(),
  token: Joi.string().required(),
});

const verifyPaymentValidation = Joi.object({
  data: Joi.string().required(),
});

export { initiatePayValidation, verifyPaymentValidation };
