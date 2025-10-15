module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;
  // Define models
  const Orders = sequelize.define(
    "Orders",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      email: Sequelize.STRING,
      totalPrice: Sequelize.DECIMAL(10, 2),
      discountAmount: Sequelize.DECIMAL(10, 2),
      discountPercentage: Sequelize.DECIMAL(10, 2),
      soldPrice: Sequelize.DECIMAL(10, 2),
      orderStatusId: Sequelize.INTEGER,
      shippingCharge: Sequelize.DECIMAL(10, 2),
      orderStatus: Sequelize.STRING,
      isLoggedIn: Sequelize.BOOLEAN,
      customerId: Sequelize.INTEGER,
    },
    {
      tableName: "Orders",
      timestamps: false,
    }
  );

  const Payments = sequelize.define(
    "Payments",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      orderId: Sequelize.STRING,
      customerId: Sequelize.INTEGER,
      shippingCharge: Sequelize.DECIMAL(10, 2),
      paymentStatus: Sequelize.BOOLEAN,
      totalPrice: Sequelize.DECIMAL(10, 2),
      amount: Sequelize.DECIMAL(10, 2),
    },
    {
      tableName: "Payments",
      timestamps: false,
    }
  );

  const allOrders = await Orders.findAll();

  for(const order of allOrders){
    await Payments.update(
      {
        amount: order.soldPrice,
      },
      {
        where: {
          orderId: order.id,
        },
      }
    );
  };

  // const update = await Payments.update(
  //   {
  //     amount: Sequelize.col("totalPrice"),
  //   },
  //   {
  //     where: {
  //       [Op.or]: [{ amount: null }, { amount: 0 }],
  //     },
  //   }
  // );
};
