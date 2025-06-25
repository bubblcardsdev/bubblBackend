import model from "../models/index.js";

export default async function ValidateOrder(orderId, email) {
  try {
    const order = await model.Order.findOne({
      where: { id: orderId },
    });

    if (!order) {
      console.warn("Order not found");
      return false;
    }

    console.log(order);
    

    if (order.email !== email) {
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error validating order:", err);
    return false;
  }
}
