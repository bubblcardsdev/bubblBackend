const XLSX = require("xlsx");
const path = require("path");

module.exports = async (sequelize /*, Sequelize */) => {
  const filePath = path.resolve(__dirname, "../data/Deviceinventories.xlsx"); // check case!
  console.log("[seed] reading:", filePath);

  try {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // Parse as objects; empty cells -> null
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
    console.log(`[seed] rows: ${rows.length}`);

    // Helper: normalize empty strings to null
    const nn = (v) => (v === "" ? null : v);

    // ⚠️ Make sure your table really uses "availability" (not misspelled "availablity")
    // Columns we insert: adjust names if your DB differs
    const insertSql = `
  INSERT INTO bubbldb.DeviceInventories
  (id, name, productId, deviceTypeId, materialTypeId, colorId, patternId,
   price, discountPercentage, availability, isActive, shortDescription, deviceDescription)
  VALUES
  (:id, :name, :productId, :deviceTypeId, :materialTypeId, :colorId, :patternId,
   :price, :discountPercentage, :availability, :isActive, :shortDescription, :deviceDescription)
  ON DUPLICATE KEY UPDATE
    productId = VALUES(productId),
    name = VALUES(name),
    deviceTypeId = VALUES(deviceTypeId),
    materialTypeId = VALUES(materialTypeId),
    colorId = VALUES(colorId),
    patternId = VALUES(patternId),
    price = VALUES(price),
    discountPercentage = VALUES(discountPercentage),
    availability = VALUES(availability),
    isActive = VALUES(isActive),
    shortDescription = VALUES(shortDescription),
    deviceDescription = VALUES(deviceDescription);
`;

    await sequelize.transaction(async (t) => {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        console.log(rows[i]);
        // Map Excel columns -> DB columns
        // (Use the column names from your SELECT/export)
        const params = {
          id: nn(r.id),
          name: nn(r?.deviceName || r?.name || r?.deviceType), // <- will fill :name
          productId: nn(r.productId),
          deviceTypeId: nn(r.deviceTypeId),
          materialTypeId: nn(r.materialId === "NULL" ? null : r.materialId),
          colorId: nn(r.colorId === "NULL" ? null : r.colorId),
          patternId: nn(r.patternId === "NULL" ? null : r.patternId),
          price: nn(r.price),
          discountPercentage: nn(r.discountPercentage),
          availability: nn(r.availability),
          isActive: nn(r.isActive),
          shortDescription: nn(r.shortDescription),
          deviceDescription: nn(r.deviceDescription),
        };

        // Skip totally empty rows
        if (Object.values(params).every((v) => v === null || v === undefined))
          continue;

        try {
          await sequelize.query(insertSql, {
            replacements: params,
            transaction: t,
          });
          console.log(`[seed] Inserted row ${i + 1}`);
        } catch (err) {
          console.error(`[seed] Error on row ${i + 1}`, err);
          // throw err; // uncomment to fail-fast
        }
      }
    });

    console.log("[seed] done");
  } catch (error) {
    console.error("[seed] Error reading Excel file:", error);
  }
};
