// helpers/orderHelpers.ts
import crypto from "crypto";
import config from "../config/config.js";

export const calculateOrderItems = (cartItems, productDetails) => {
  let totalOrderPrice = 0;
  let totalSellingPrice = 0;
  let totalDiscountAmount = 0;

  const orderItems = cartItems.map((cartItem, index) => {
    const product = productDetails[index];
    const quantity = cartItem.quantity;

    const originalPricePerUnit = product.price;
    const discountAmountPerUnit =
      (originalPricePerUnit * product.discountPercentage) / 100;
    const discountedPricePerUnit = originalPricePerUnit - discountAmountPerUnit;

    totalOrderPrice += originalPricePerUnit * quantity;
    totalSellingPrice += discountedPricePerUnit * quantity;
    totalDiscountAmount += discountAmountPerUnit * quantity;

    return {
      productId: cartItem.productId,
      quantity,
      originalPrice: originalPricePerUnit,
      discountAmount: discountAmountPerUnit,
      discountedPrice: discountedPricePerUnit,
      discountPercentage: product.discountPercentage,
      sellingPrice: discountedPricePerUnit,
      fontId: cartItem.fontId || null,
      customName: cartItem.customName || null,
    };
  });

  return {
    orderItems,
    totalOrderPrice,
    totalSellingPrice,
    totalDiscountAmount,
  };
};

export const verifyRazorpaySignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const generatedSignature = crypto
    .createHmac("sha256", config.razorpaySecretId)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

return generatedSignature === razorpay_signature;

};
