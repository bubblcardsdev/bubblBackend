// scripts/run-data-migrations.js
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize";
import dbConfig from "../config/config.js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  const env = process.env.NODE_ENV || "development";
  const config = dbConfig[env];

  const sequelize = new Sequelize(process.env.DB_URL);

  const migrationDir = path.resolve(__dirname, "../migrations/data-migrations");
  const files = (await fs.readdir(migrationDir)).sort();

  for (const file of files) {
    const migrationPath = path.join(migrationDir, file);
    const migrationModule = await import(`file://${migrationPath}`);
    const migration = migrationModule.default || migrationModule;

    console.log(`Running migration: ${file}`);
    await migration(sequelize, Sequelize);
  }

  await sequelize.close();
  console.log("All data migrations completed");
};

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
