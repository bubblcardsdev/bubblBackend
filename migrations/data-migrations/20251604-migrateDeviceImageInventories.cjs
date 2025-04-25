const XLSX = require("xlsx");
const path = require("path");
module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

  const deviceImageInventories = sequelize.define(
    "DeviceImageInventories",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      imageKey: Sequelize.STRING,
      deviceId: Sequelize.INTEGER,
    },
    {
      tableName: "DeviceImageInventories",
      timestamps: false,
    }
  );

  const filePath = path.resolve(__dirname, "./DeviceImagesBubbl.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  for (const row of rows) {
    const sql = row[7];
    console.log(sql, "sdfsd");
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
