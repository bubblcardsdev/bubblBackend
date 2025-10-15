//creating order breakdown table from carts table

const pkg = require("lodash");

const { isEmpty } = pkg;

module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

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
      productPrice: Sequelize.DECIMAL(10, 2),
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
      discountPercentage: Sequelize.DECIMAL(10, 2),
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
      originalPrice: Sequelize.DECIMAL(10, 2),
      discountedPrice: Sequelize.DECIMAL(10, 2),
      discountPercentage: Sequelize.DECIMAL(10, 2),
      discountedAmount: Sequelize.DECIMAL(10, 2),
      sellingPrice: Sequelize.DECIMAL(10, 2),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    {
      tableName: "OrderBreakDowns",
      timestamps: false,
    }
  );
  const getAllOrders = await Orders.findAll({
    // where: {
    //   orderStatusId: 3,
    // },
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
    const sumCarts = await Carts.sum("productPrice", {
      where: {
        orderId: orders.id,
        productStatus: true,
      },
    });
    const totalPrice = parseFloat(orders.totalPrice || 0);
    const cartSum = parseFloat(sumCarts || 0);

    const isExactMatch =
      Math.round(cartSum * 100) === Math.round(totalPrice * 100);
    for (const item of findAllCarts) {
      const product = await DeviceInventories.findOne({
        where: {
          productId: item.productId,
        },
      });
      const quantity = item?.quantity || 1;
      const productPrice = isExactMatch
        ? item.productPrice / quantity
        : item.productPrice;

      const discountedPrice = (quantity > 1 || findAllCarts.length > 1) ?
        (productPrice -
        (productPrice * (orders?.discountPercentage || 0)) / 100) :
        Math.round(productPrice - (productPrice * (orders?.discountPercentage || 0)) / 100);

      const discountAmount = productPrice - discountedPrice;

      const orderBreakDown = {
        orderId: orders.id,
        productId: item.productId,
        quantity: quantity,
        fontId: null,
        customName: null,
        originalPrice: productPrice,
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
