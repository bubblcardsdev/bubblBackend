const XLSX = require("xlsx");
const path = require("path");

module.exports = async (sequelize, Sequelize) => {
  try {
    const filePath = path.resolve(__dirname, "../data/Deviceinventories.xlsx");
    console.log(filePath, "file path");
    const workbook = XLSX.readFile(filePath);
    console.log(workbook, "workbook");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log(sheet, "sheet");
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(rows, "rows");

    for (const row of rows) {
      console.log(row, "row");
      const sql = row[17];
      if (sql && typeof sql === "string") {
        try {
          console.log(`Running: ${sql}`);
          const cleanSql = sql.replace(/''/g, "NULL");
          console.log(`Running: ${cleanSql}`);
          await sequelize.query(cleanSql);
          console.log(`Executed: ${sql}`);
        } catch (error) {
          console.log(`Error running: ${sql}\n${error}`);
        }
      }
    }
  } catch (error) {
    console.error("Error reading Excel file:", error);
  }
};
