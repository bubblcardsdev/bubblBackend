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
      totalPrice: Sequelize.INTEGER,
      amount: Sequelize.INTEGER,
    },
    {
      tableName: "Payments",
      timestamps: false,
    }
  );

  const update = await Payments.update(
    {
      amount: Sequelize.col("totalPrice"),
    },
    {
      where: {
        amount: null,
      },
    }
  );
};
