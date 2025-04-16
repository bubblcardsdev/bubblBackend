import Joi from "joi";

const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  fontId: Joi.string().optional(),
  customName: Joi.string().optional(),
  quantity: Joi.number().min(1).required(),
});

const cancelCartValidation = Joi.object({
  cartId: Joi.number().required(),
});

const getProductId = Joi.object({
  productId: Joi.string().required(),
});

const addToNonUserCartSchema = Joi.object({
  productData: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        fontId: Joi.string().optional(),
        customName: Joi.string().optional(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),

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
    isShipped: Joi.boolean().required(),
  }).required(),
});

export {
  addToCartSchema,
  addToNonUserCartSchema,
  getProductId,
  cancelCartValidation,
};
