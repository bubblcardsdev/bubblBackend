module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

  // ===== Models (include fields you actually query!) =====
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
      productStatus: Sequelize.BOOLEAN,
    },
    { tableName: "Carts", timestamps: false }
  );

  const DeviceInventories = sequelize.define(
    "DeviceInventories",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      deviceTypeId: Sequelize.INTEGER,
      colorId: Sequelize.INTEGER,
      patternId: Sequelize.INTEGER,       // <-- add
      materialTypeId: Sequelize.INTEGER,  // <-- add
    },
    { tableName: "DeviceInventories", timestamps: false }
  );

  const DeviceTypes = sequelize.define(
    "DeviceTypeMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    { tableName: "DeviceTypeMasters", timestamps: false }
  );

  const Colors = sequelize.define(
    "DeviceColorMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    { tableName: "DeviceColorMasters", timestamps: false }
  );

  const Patterns = sequelize.define(
    "DevicePatternMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    { tableName: "DevicePatternMasters", timestamps: false }
  );

  const Fonts = sequelize.define(
    "CustomFontMasters",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
    },
    { tableName: "CustomFontMasters", timestamps: false }
  );

  const NameCustoms = sequelize.define(
    "NameCustomCards",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      orderId: Sequelize.INTEGER,
      customName: Sequelize.STRING,
      fontStyle: Sequelize.STRING,
    },
    { tableName: "NameCustomCards", timestamps: false }
  );

  try {
    // ===== Preload lookups to avoid N+1 =====
    const [deviceTypes, colors, patterns, fonts] = await Promise.all([
      DeviceTypes.findAll(),
      Colors.findAll(),
      Patterns.findAll(),
      Fonts.findAll(),
    ]);

    const mapByLower = (rows, key = "name") =>
      rows.reduce((acc, r) => {
        const k = (r[key] || "").toString().trim().toLowerCase();
        if (k) acc[k] = r;
        return acc;
      }, {});

    const deviceTypeByName = mapByLower(deviceTypes, "name");
    const colorByName = mapByLower(colors, "name");
    const patternByName = mapByLower(patterns, "name");
    const fontByName = mapByLower(fonts, "name"); // may be used later

    // For clarity, identify your "Name Custom" device type by NAME (not hardcoded ID)
    // Adjust this if your canonical name differs.
    const NAME_CUSTOM_TYPE_NAME = "name custom";

    // PVC / Metal pattern maps
    const PVC_PATTERNS = {
      black: "princeCout",
      darkgrey: "zebraGrey",
      red: "bikanerRed",
      green: "sonicGreen",
      purple: "purpleCarrara",
      lightgrey: "pixelBomb",
      grey: "nightShowel",
      orange: "maze",
    };

    const METAL_PATTERNS = {
      black: "AlmondGold",
      darkgrey: "poggendorff",
      green: "sonicGreen",
    };

    // ===== Fetch carts to process =====
    const carts = await Carts.findAll({ where: { productId: null } });

    for (const cart of carts) {
      try {
        // Normalize productType to pick the device type name
        const pt = (cart.productType || "").trim();
        const deviceTypeName = pt.includes("NC-") ? "Name Custom" : pt;
        const dt = deviceTypeByName[(deviceTypeName || "").toLowerCase()];

        if (!dt) {
          console.log(`DeviceType not found for cart ${cart.id}: '${cart.productType}'`);
          continue; // <-- was break
        }

        // name custom?
        const isNameCustom = deviceTypeName.toLowerCase() === NAME_CUSTOM_TYPE_NAME;

        // Resolve color/pattern id
        let colorId = null;
        let patternId = null;
        let materialTypeId = 1; // default PVC=1 (guess). Adjust to your real enum.

        // Decide by productType family for Name Custom
        if (isNameCustom) {
          // material override by productType
          if (pt === "NC-Metal") materialTypeId = 2;
          else if (pt === "NC-Bamboo") materialTypeId = 3;

          // pick pattern key
          let patternKey = null;
          if (pt === "NC-Metal") {
            patternKey = (cart.productColor || "").trim().toLowerCase();
            const mapped = METAL_PATTERNS[patternKey];
            if (!mapped) {
              console.log(`No metal pattern for color '${cart.productColor}' (cart ${cart.id})`);
              continue;
            }
            const p = patternByName[mapped.toLowerCase()];
            if (!p) {
              console.log(`Pattern '${mapped}' not found (cart ${cart.id})`);
              continue;
            }
            patternId = p.id;
          } else if (pt === "NC-Bamboo") {
            // fixed bamboo pattern?
            const mapped = "starOfBethlehem";
            const p = patternByName[mapped.toLowerCase()];
            if (!p) {
              console.log(`Pattern '${mapped}' not found (cart ${cart.id})`);
              continue;
            }
            patternId = p.id;

            // If bamboo must force a color, choose the desired colorId explicitly
            // (previous code mutated instance; pick explicitly instead)
            const bambooColorName = "black"; // or whatever your default should be
            const c = colorByName[bambooColorName];
            colorId = c ? c.id : null;
          } else {
            // PVC name custom
            const key = (cart.productColor || "").trim().toLowerCase();
            const mapped = PVC_PATTERNS[key];
            if (!mapped) {
              console.log(`No PVC pattern for color '${cart.productColor}' (cart ${cart.id})`);
              continue;
            }
            const p = patternByName[mapped.toLowerCase()];
            if (!p) {
              console.log(`Pattern '${mapped}' not found (cart ${cart.id})`);
              continue;
            }
            patternId = p.id;
          }

          // Find inventory by (deviceTypeId, patternId, materialTypeId)
          const matched = await DeviceInventories.findOne({
            where: {
              deviceTypeId: dt.id,
              patternId,
              materialTypeId,
            },
          });

          if (matched) {
            await cart.update({ productId: matched.id });
            console.log(`Cart ${cart.id} -> productId ${matched.id}`);
          } else {
            console.log(
              `No inventory for cart ${cart.id} (deviceTypeId=${dt.id}, patternId=${patternId}, materialTypeId=${materialTypeId})`
            );
          }
        } else {
          // Non name-custom: match by color
          const colorName = (cart.productColor || "").trim().toLowerCase();
          if (!colorName) {
            console.log(`Missing productColor for cart ${cart.id}`);
            continue;
          }
          const color = colorByName[colorName];
          if (!color) {
            console.log(`Color '${cart.productColor}' not found (cart ${cart.id})`);
            continue;
          }
          colorId = color.id;

          const matched = await DeviceInventories.findOne({
            where: {
              deviceTypeId: dt.id,
              colorId,
            },
          });

          if (matched) {
            await cart.update({ productId: matched.id });
            console.log(`Cart ${cart.id} -> productId ${matched.id}`);
          } else {
            console.log(
              `No inventory for cart ${cart.id} (deviceTypeId=${dt.id}, colorId=${colorId})`
            );
          }
        }
      } catch (err) {
        console.log(`Error processing cart ${cart.id}:`, err.message);
      }
    }

    // Fallbacks for Bamboo & Metal if still null
    const bambooFallback = await Carts.findAll({
      where: { productType: "NC-Bamboo", productId: null },
    });
    for (const cart of bambooFallback) {
      await cart.update({ productId: 44 }); // confirm 44 exists in DeviceInventories
    }

    const metalFallback = await Carts.findAll({
      where: { productType: "NC-Metal", productId: null },
    });
    for (const cart of metalFallback) {
      await cart.update({ productId: 42 }); // confirm 42 exists in DeviceInventories
    }

    // Enrich NC carts with customName + fontId
    const ncCarts = await Carts.findAll({
      where: { productType: { [Op.like]: "%NC%" } },
    });

    for (const cart of ncCarts) {
      const nc = await NameCustoms.findOne({ where: { orderId: cart.orderId } });
      if (!nc) {
        console.log(`No custom name for cart ${cart.id}`);
        continue;
      }

      const fontKey = (nc.fontStyle || "").toLowerCase();
      let font = fontByName[fontKey];

      // If DB collation is case-sensitive and names differ in case, fall back to LOWER(name) match:
      if (!font) {
        font = await Fonts.findOne({
          where: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            fontKey
          ),
        });
      }

      if (!font) {
        console.log(`No font '${nc.fontStyle}' for cart ${cart.id}`);
        continue;
      }

      await cart.update({ customName: nc.customName, fontId: font.id });
    }

    console.log("Cart productId backfill completed");
  } catch (error) {
    console.error("Error during migration:", error.message);
  }
};
