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
    .min(1).optional(),

  promoCode: Joi.string().optional(),

  shippingFormData: Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    phoneNumber: Joi.string().required(),
    emailId: Joi.string().email().required(),
    companyName: Joi.string().optional().allow(""), // Allow empty string
    address: Joi.string().min(5).required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    zipcode: Joi.number().integer().required(),
    country: Joi.string().min(2).max(50).required(),
    landmark: Joi.string().optional().allow(""),
    // isShipped: Joi.boolean().required(),
  }).required(),
});

export { checkOutValidation  };
