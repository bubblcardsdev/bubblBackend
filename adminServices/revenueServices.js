import model from "../models/index.js";
import { Sequelize } from "sequelize";

async function RevenueServices() {
  // func for get all the payment for Order table
  const totalDeviceRevenue = await model.Order.findAll({
    where: {
      orderStatus: "Paid",
      cancelledOrder: false,
    },
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col("totalPrice")), "totalDeviceRevenue"], // sum tha all payment in rows
    ],
  });

  // func for get all the Plan Payment for Order table
  const totalPlanRevenue = await model.PlanPayment.findAll({
    where: {
      paymentStatus: true,
    },
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col("totalPrice")), "totalPlanRevenue"], // sum tha all payment in rows
    ],
  });
  //  adding two values
  const totalRevenue =
    Number(totalDeviceRevenue[0].dataValues.totalDeviceRevenue) +
    Number(totalPlanRevenue[0].dataValues.totalPlanRevenue);

  return totalRevenue;
}
export default RevenueServices;
