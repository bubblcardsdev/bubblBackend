module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;
  // Define models
  const Orders = sequelize.define(
    "Orders",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      email: Sequelize.STRING,
      totalPrice: Sequelize.INTEGER,
      discountAmount: Sequelize.INTEGER,
      discountPercentage: Sequelize.INTEGER,
      soldPrice: Sequelize.INTEGER,
      orderStatusId: Sequelize.INTEGER,
      shippingCharge: Sequelize.INTEGER,
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
      shippingCharge: Sequelize.INTEGER,
      paymentStatus: Sequelize.BOOLEAN,
    },
    {
      tableName: "Payments",
      timestamps: false,
    }
  );

  const Carts = sequelize.define(
    "Carts",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      orderId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      quantity: Sequelize.INTEGER,
      productPrice: Sequelize.INTEGER,
    },
    {
      tableName: "Carts",
      timestamps: false,
    }
  );

  const OrderBreakDownTable = sequelize.define(
    "OrderBreakDowns",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      orderId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      quantity: Sequelize.INTEGER,
      fontId: Sequelize.INTEGER,
      customName: Sequelize.STRING,
      originalPrice: Sequelize.INTEGER,
      discountedPrice: Sequelize.INTEGER,
      discountPercentage: Sequelize.INTEGER,
      discountedAmount: Sequelize.INTEGER,
      sellingPrice: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    {
      tableName: "OrderBreakDowns",
      timestamps: false,
    }
  );
  const getAllOrders = await Orders.findAll({});
  const orderStatusEnum = {
    Created: 1,
    Cancelled: 2,
    Success: 3,
    Failure: 4,
    Shipped: 5,
  };
  const statusMapping = {
    cart: "Created",
    cancelled: "Cancelled",
    paid: "Success",
    shipped: "Shipped",
  };
  for (const orders of getAllOrders) {
    const oldStatus = orders.orderStatus?.toLowerCase();
    const mappedStatus = statusMapping[oldStatus] || "Paid";
    const orderStatuses = orderStatusEnum[mappedStatus];
    const payment = await Payments.findOne({
      where: {
        orderId: orders.id,
        paymentStatus: true,
      },
    });
    await Orders.update(
      {
        orderStatusId: orderStatuses,
        isLoggedIn: orders.customerId ? true : false,
        shippingCharge: payment?.shippingCharge || 0,
      },
      {
        where: {
          id: orders.id,
        },
      }
    );
  }

  const completedOrders = await Orders.findAll({
    where: {
      orderStatusId: 3,
    },
  });

  for (const order of completedOrders) {
    if (
      order.totalPrice !== order.soldPrice &&
      order.discountAmount === 0 &&
      order.soldPrice === 0
    ) {
      console.log("came here", order.id);
      await Orders.update(
        {
          soldPrice: order.totalPrice,
        },
        {
          where: {
            id: order.id,
          },
        }
      );
    }
  }

  // const cancelledOrders = await Orders.findAll({
  //   where: {
  //     orderStatusId: 2,
  //   },
  // });

  // for (const order of cancelledOrders) {
  //   await Carts.update(
  //     {
  //       productStatus: false,
  //     },
  //     {
  //       where: {
  //         orderId: order.id,
  //       },
  //     }
  //   );
  // }
};
