// // data-migrations/20250416-fill-cart-productId.js

module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

  // Define models
  const Carts = sequelize.define(
    "Carts",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      productType: Sequelize.STRING,
      productColor: Sequelize.STRING,
      productId: Sequelize.INTEGER,
      orderId: Sequelize.INTEGER,
      customName: Sequelize.STRING,
      fontId: Sequelize.INTEGER,
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
      colorId: Sequelize.INTEGER,
    },
    {
      tableName: "DeviceInventories",
      timestamps: false,
    }
  );

  const DeviceTypes = sequelize.define(
    "DeviceTypeMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    {
      tableName: "DeviceTypeMasters",
      timestamps: false,
    }
  );

  const Colors = sequelize.define(
    "DeviceColorMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    {
      tableName: "DeviceColorMasters",
      timestamps: false,
    }
  );

  const Patterns = sequelize.define(
    "DevicePatternMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    {
      tableName: "DevicePatternMasters",
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

  const carts = await Carts.findAll({ where: { productId: null } });

  for (const cart of carts) {
    try {
      const deviceTypeName = cart.productType?.includes("NC-")
        ? "Name Custom"
        : cart.productType;

      const deviceType = await DeviceTypes.findOne({
        where: { name: deviceTypeName },
      });

      if (!deviceType) {
        console.log(
          `DeviceType not found for cart ID ${cart.id}: ${cart.productType}`
        );
        break;
      }

      let color;
      if (deviceType.id === 6) {
        if (!cart.productColor) {
          console.log(`Missing productColor for patterned cart ID ${cart.id}`);
          continue;
        }

        const patternEnum = {
          black: "blackPattern",
          darkGrey: "darkGreyPattern",
          red: "redPattern",
          green: "greenPattern",
          purple: "purplePattern",
          lightGrey: "lightGreyPattern",
          grey: "greyPattern",
          orange: "orangePattern",
        };

        const patternNameFromEnum = patternEnum[cart.productColor];

        console.log(
          `Pattern name from enum for cart ID ${cart.id}: ${patternNameFromEnum}`
        );

        color = await Patterns.findOne({
          where: {
            name: patternNameFromEnum,
          },
        });
      } else {
        color = await Colors.findOne({
          where: { name: cart.productColor },
        });
      }

      if (!color) {
        continue;
      }

      let nameCustomMaterial = 1;

      let matchedInventory;

      if (deviceType.id === 6) {
        if (cart.productType === "NC-Metal") {
          nameCustomMaterial = 2;
        } else if (cart.productType === "NC-Bamboo") {
          nameCustomMaterial = 3;
          color.id = 1;
        }
        matchedInventory = await DeviceInventories.findOne({
          where: {
            deviceTypeId: deviceType.id,
            patternId: color.id,
            materialTypeId: nameCustomMaterial,
          },
        });
      } else {
        matchedInventory = await DeviceInventories.findOne({
          where: {
            deviceTypeId: deviceType.id,
            colorId: color.id,
          },
        });
      }

      if (matchedInventory) {
        await cart.update({
          productId: matchedInventory.id,
        });
        console.log(
          `Cart ID ${cart.id} updated with productId ${matchedInventory.id}`
        );
      }
    } catch (error) {
      console.log(`Error processing cart ID ${cart.id}:`, error.message);
    }
  }

  const bamboo = await Carts.findAll({
    where: {
      productType: "NC-Bamboo",
      productId: null,
    },
  });

  for (const cart of bamboo) {
    await cart.update({ productId: 44 });
  }

  const metal = await Carts.findAll({
    where: {
      productType: "NC-Metal",
      productId: null,
    },
  });

  for (const cart of metal) {
    await cart.update({ productId: 42 });
  }

  const ncCards = await Carts.findAll({
    where: {
      productType: {
        [Op.like]: "%NC%",
      },
    },
  });

  let customName;
  let fontId;
  for (const cart of ncCards) {
    customName = await nameCustoms.findOne({
      where: {
        orderId: cart.orderId,
      },
    });
    if (!customName) {
      console.log(`No custom name found for cart ID ${cart.id}`);
      continue;
    }
    console.log("customName", customName?.fontStyle);
    fontId = await Fonts.findOne({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("name")),
        customName?.fontStyle.toLowerCase()
      ),
    });
    if (!fontId) {
      console.log(`No font found for cart ID ${cart.id}`);
      continue;
    }

    console.log("fontId", fontId.id);

    await cart.update({ customName: customName.customName, fontId: fontId.id });
  }

  console.log("Cart productId backfill completed");
};
