import Joi from "joi";

const initiatePayValidation = Joi.object({
  orderId: Joi.number().required(),
  orderType: Joi.number().required().less(3).greater(-1),
  planType: Joi.number().allow(null),
 planId: Joi.number().valid(1, 2, 3).allow(null),
  token: Joi.string().required(),
});

const verifyPaymentValidation = Joi.object({
  data: Joi.string().required(),
});

export { initiatePayValidation, verifyPaymentValidation };
