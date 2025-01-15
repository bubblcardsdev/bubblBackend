import Joi from "joi";

const addToCartSchema = Joi.object({
  cartItem: Joi.object({
    productType: Joi.string().allow(""),
    quantity: Joi.number(),
    productColor: Joi.string(),
    productPrice: Joi.number(),
    productStatus: Joi.bool(),
  })
    .and(
      "productType",
      "quantity",
      "productColor",
      "productPrice",
      "productStatus"
    )
    .required(),
});

const addToNonUserCartSchema = Joi.object({
  cartItem: Joi.object({
    productType: Joi.string().allow(""),
    quantity: Joi.number(),
    productColor: Joi.string(),
    productPrice: Joi.number(),
    productStatus: Joi.bool(),
  })
    .and(
      "productType",
      "quantity",
      "productColor",
      "productPrice",
      "productStatus"
    )
    .required(),
  email: Joi.string().email().required(),
});

export { addToCartSchema,addToNonUserCartSchema };
