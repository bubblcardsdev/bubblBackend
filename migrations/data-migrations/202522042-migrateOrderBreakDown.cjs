//creating order breakdown table from carts table

module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

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
  const Fonts = sequelize.define(
    "CustomFontMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    {
      tableName: "CustomFontMasters",
      timestamps: false,
    }
  );

  const nameCustoms = sequelize.define(
    "NameCustomCards",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      orderId: Sequelize.INTEGER,
      customName: Sequelize.STRING,
      fontStyle: Sequelize.STRING,
    },
    {
      tableName: "NameCustomCards",
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

  const DeviceInventories = sequelize.define(
    "DeviceInventories",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      deviceTypeId: Sequelize.INTEGER,
      price: Sequelize.INTEGER,
      discountPercentage: Sequelize.INTEGER,
      productId: Sequelize.UUID,
    },
    {
      tableName: "DeviceInventories",
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
  const getAllOrders = await Orders.findAll({
    where: {
      orderStatusId: 3,
    },
  });
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
    const findAllCarts = await Carts.findAll({
      where: {
        orderId: orders.id,
        productStatus: true,
      },
    });

    for (const item of findAllCarts) {
      const product = await DeviceInventories.findOne({
        where: {
          productId: item.productId,
        },
      });

      const discountAmount =
        (item.productPrice * orders.discountPercentage) / 100;
      const discountedPrice = item.productPrice - discountAmount;

      const orderBreakDown = {
        orderId: orders.id,
        productId: item.productId,
        quantity: item.quantity,
        fontId: null,
        customName: null,
        originalPrice: item.productPrice,
        discountedPrice: discountedPrice,
        discountPercentage: orders.discountPercentage,
        discountedAmount: discountAmount,
        sellingPrice: discountedPrice,
      };

      await OrderBreakDownTable.create(orderBreakDown);
    }

    //to update the custom name and font id in the order breakdown table
    const ncCards = await Carts.findAll({
      where: {
        orderId: orders.id,
        productStatus: true,
        productType: {
          [Op.like]: "%NC%",
        },
      },
    });

    for (const cart of ncCards) {
      const customName = await nameCustoms.findOne({
        where: {
          orderId: cart.orderId,
        },
      });

      if (!customName) {
        console.log(`No custom name found for cart ID ${cart.id}`);
        continue;
      }

      const font = await Fonts.findOne({
        where: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          customName?.fontStyle.toLowerCase()
        ),
      });

      if (!font) {
        console.log(`No font found for cart ID ${cart.id}`);
        continue;
      }

      await OrderBreakDownTable.update(
        {
          customName: customName.customName,
          fontId: font.id,
        },
        {
          where: {
            orderId: cart.orderId,
            productId: cart.productId,
          },
        }
      );
    }
  }
};
