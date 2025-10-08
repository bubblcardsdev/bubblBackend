module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

  // Minimal model definitions (no schema changes)
  const DeviceLinks = sequelize.define(
    "DeviceLinks",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      modeId: Sequelize.INTEGER,
    },
    { tableName: "DeviceLinks", timestamps: false }
  );

  const Profiles = sequelize.define(
    "Profiles",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      modeId: Sequelize.INTEGER,
    },
    { tableName: "Profiles", timestamps: false }
  );

  // --- DeviceLinks ---
  // 1) Set modeId = 1 for everything that is NOT old 3
  await DeviceLinks.update(
    { modeId: 1 },
    {
      where: {
        [Op.or]: [
          { modeId: { [Op.ne]: 3 } },
          { modeId: null }, // handle NULLs as "rest"
        ],
      },
    }
  );

  // 2) Set modeId = 2 for old 3
  await DeviceLinks.update(
    { modeId: 2 },
    {
      where: { modeId: 3 },
    }
  );

  // --- Profiles ---
  // 1) Set modeId = 1 for everything that is NOT old 3
  await Profiles.update(
    { modeId: 1 },
    {
      where: {
        [Op.or]: [
          { modeId: { [Op.ne]: 3 } },
          { modeId: null }, // handle NULLs as "rest"
        ],
      },
    }
  );

  // 2) Set modeId = 2 for old 3
  await Profiles.update(
    { modeId: 2 },
    {
      where: { modeId: 3 },
    }
  );

  // Optional logs
  console.log("Mode remap complete: DeviceLinks & Profiles updated.");
};
