const XLSX = require("xlsx");
const path = require("path");
// const excel = require("./excel/DeviceInventories.xlsx");

module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

  const deviceInventories = sequelize.define(
    "DeviceInventories",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      name: Sequelize.STRING,
      deviceTypeId: Sequelize.INTEGER,
      colorId: Sequelize.INTEGER,
      patternId: Sequelize.INTEGER,
      materialId: Sequelize.INTEGER,
      productId: Sequelize.UUID,
      shortDescription: Sequelize.STRING,
      deviceDescription: Sequelize.STRING,
      productDetails: Sequelize.STRING,
      price: Sequelize.INTEGER,
      discountPercentage: Sequelize.INTEGER,
      availability: Sequelize.BOOLEAN,
    },
    {
      tableName: "DeviceInventories",
      timestamps: false,
    }
  );

  const filePath = path.resolve(__dirname, "./DeviceInventories.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  for (const row of rows) {
    const sql = row[18];
    if (sql && typeof sql === "string") {
      try {
        const cleanSql = sql.replace(/''/g, "NULL");
        await sequelize.query(cleanSql);
        console.log(`Executed: ${sql}`);
      } catch (error) {
        console.log(`Error running: ${sql}\n${error}`);
      }
    }
  }
};
