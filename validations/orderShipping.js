import Joi from "joi";

const checkOutValidation = Joi.object({
  productData: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        fontId: Joi.number().optional().allow(null),
        customName: Joi.string().optional().allow(null),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .optional(),

  promoCode: Joi.string().optional().allow(""), // Allow empty string

  shippingFormData: Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9]{7,15}$/) // Supports optional "+" and 7-15 digits
      .required(),
    emailId: Joi.string().email().required(),
    companyName: Joi.string().optional().allow(""), // Allow empty string
    address: Joi.string().required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    zipcode: Joi.number().integer().required(),
    country: Joi.string().min(2).max(50).required(),
    landmark: Joi.string().optional().allow(""),
    // isShipped: Joi.boolean().required(),
  }).required(),
});

const getOrderValidation = Joi.object({
  orderId: Joi.number().required().greater(0),
});

const getPromoValidation = Joi.object({
    productData: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .optional(),

  promoCode: Joi.string().optional().allow(""), 
});

const createPlanOrderValidation = Joi.object({
  planId: Joi.number()
    .valid(2, 3)
    .required(),
 planType: Joi.string()
    .valid("monthly", "yearly")
    .required()
}).strict();
export { checkOutValidation, getOrderValidation, getPromoValidation,createPlanOrderValidation };