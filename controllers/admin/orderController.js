import {
  PendingOrderCountServices,
  getCountServices,
  getOrderByIdServices,
  getTotalOrderServices,
  updateOrderStatusServices,
  getShippedOrderServices,
} from "../../adminServices/orderServices.js";

async function getAllOrders(req, res) {
  const totalOrders = await getTotalOrderServices();
  return res.json({
    totalOrders,
  });
}

// get call for shipped order
async function getShippedController(req, res) {
  const shippedOrders = await getShippedOrderServices();
  return res.json({
    shippedOrders,
  });
}

async function getOrdersCount(req, res) {
  const orderCount = await getCountServices();
  return res.json({
    orderCount,
  });
}
async function getPendingOrderCountController(req, res) {
  const pendingOrderCount = await PendingOrderCountServices();
  return res.json({
    pendingOrderCount,
  });
}

async function getOrderByController(req, res) {
  const { userId, orderId } = req.body;
  try {
    const getOrderById = await getOrderByIdServices(res, orderId, userId);
    return getOrderById;
  } catch (e) {
    console.log(e);
  }
}

async function updateOrderController(req, res) {
  const { userId, orderId, orderStatus } = req.body;
  try {
    const updateOrderStatus = await updateOrderStatusServices(
      res,
      userId,
      orderId,
      orderStatus
    );
    return updateOrderStatus;
  } catch (e) {
    console.log(e);
  }
}
export {
  getAllOrders,
  getOrdersCount,
  getPendingOrderCountController,
  getOrderByController,
  updateOrderController,
  getShippedController,
};
