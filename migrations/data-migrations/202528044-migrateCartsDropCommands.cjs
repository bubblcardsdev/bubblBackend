module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

  const queryInterface = sequelize.getQueryInterface();

  // const Carts = sequelize.define(
  //   "Carts",
  //   {
  //     id: { type: Sequelize.INTEGER, primaryKey: true },
  //     customerId: Sequelize.INTEGER,
  //     orderId: Sequelize.INTEGER,
  //     productType: Sequelize.STRING,
  //     quantity: Sequelize.INTEGER,
  //     productColor: Sequelize.STRING,
  //     productStatus: Sequelize.BOOLEAN,
  //     email: Sequelize.STRING,
  //     productId: Sequelize.INTEGER,
  //     customName: Sequelize.STRING,
  //     fontId: Sequelize.INTEGER,
  //   },
  //   {
  //     tableName: "Carts",
  //     timestamps: false,
  //   }
  // );

  // const Orders = sequelize.define(
  //   "Orders",
  //   {
  //     id: { type: Sequelize.INTEGER, primaryKey: true },
  //     email: Sequelize.STRING,
  //     totalPrice: Sequelize.INTEGER,
  //     discountAmount: Sequelize.INTEGER,
  //     discountPercentage: Sequelize.INTEGER,
  //     soldPrice: Sequelize.INTEGER,
  //     orderStatusId: Sequelize.INTEGER,
  //     shippingCharge: Sequelize.INTEGER,
  //     orderStatus: Sequelize.STRING,
  //     isLoggedIn: Sequelize.BOOLEAN,
  //     customerId: Sequelize.INTEGER,
  //   },
  //   {
  //     tableName: "Orders",
  //     timestamps: false,
  //   }
  // );

  // const Payments = sequelize.define(
  //   "Payments",
  //   {
  //     id: { type: Sequelize.INTEGER, primaryKey: true },
  //     orderId: Sequelize.STRING,
  //     customerId: Sequelize.INTEGER,
  //     shippingCharge: Sequelize.INTEGER,
  //     paymentStatus: Sequelize.BOOLEAN,
  //   },
  //   {
  //     tableName: "Payments",
  //     timestamps: false,
  //   }
  // );

  // const Shipping = sequelize.define(
  //   "Shipping",
  //   {
  //     id: { type: Sequelize.INTEGER, primaryKey: true },
  //     orderId: Sequelize.INTEGER,
  //     firstName: Sequelize.STRING,
  //     lastName: Sequelize.STRING,
  //     phoneNumber: sequelize.STRING,
  //     emailId: Sequelize.STRING,
  //     flatNumber: Sequelize.STRING,
  //     address: Sequelize.STRING,
  //     city: Sequelize.STRING,
  //     state: Sequelize.STRING,
  //     country: Sequelize.STRING,
  //     zipCode: Sequelize.INTEGER,
  //     landmark: Sequelize.STRING,
  //   },
  //   {
  //     tableName: "Shipping",
  //     timestamps: false,
  //   }
  // );

  //#region - destroy
  //   const allOrders = await Orders.findAll({
  //     where: {
  //       orderStatusId: { [Op.notIn]: [2, 5] },
  //     },
  //   });

  //   for (const order of allOrders) {
  //     const findAllActiveCarts = await Carts.findAll({
  //       where: {
  //         orderId: order.id,
  //         productStatus: true,
  //       },
  //     });

  //     for (const cart of findAllActiveCarts) {
  //       await cart.destroy({});
  //     }

  //     await Payments.destroy({
  //       where: {
  //         orderId: order.id,
  //         paymentStatus: false,
  //       },
  //     });

  //     await Shipping.destroy({
  //       where: {
  //         orderId: order.id,
  //       },
  //     });

  //     await order.destroy({});
  //   }
  //#endregion

  await queryInterface.removeColumn("Carts", "productType");
  await queryInterface.removeColumn("Carts", "productColor");
  // await queryInterface.removeColumn("Carts", "email");
  await queryInterface.removeColumn("Carts", "productPrice");

  //orders

  await queryInterface.removeColumn("Orders", "orderStatus");
  await queryInterface.removeColumn("Orders", "cancelledOrder");
  await queryInterface.removeColumn("Orders", "discountPercentage");
  await queryInterface.removeColumn("Orders", "deliveryBy");

  //payments
  await queryInterface.removeColumn("Payments", "shippingCharge");
  await queryInterface.removeColumn("Payments", "discountPercentage");
  await queryInterface.removeColumn("Payments", "discountAmount");
  await queryInterface.removeColumn("Payments", "soldPrice");
  await queryInterface.removeColumn("Payments", "totalPrice");
};
