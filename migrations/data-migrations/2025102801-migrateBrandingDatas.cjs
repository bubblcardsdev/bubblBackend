// migrations/20251028-add-profile-branding-and-migrate-from-device-brandings.js
"use strict";

module.exports = async (sequelize, Sequelize) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.sequelize.transaction(async (t) => {
    // 1) Add columns to Profiles
    // Defaults: accent -> '#60449a'; other three -> NULL
    const table = await queryInterface.describeTable("Profiles", {
      transaction: t,
    });

    if (!table.brandingBackGroundColor) {
      await queryInterface.addColumn(
        "Profiles",
        "brandingBackGroundColor",
        { type: Sequelize.STRING, allowNull: true, defaultValue: null },
        { transaction: t }
      );
    }
    if (!table.brandingAccentColor) {
      await queryInterface.addColumn(
        "Profiles",
        "brandingAccentColor",
        { type: Sequelize.STRING, allowNull: true, defaultValue: "#60449a" },
        { transaction: t }
      );
    }
    if (!table.brandingFontColor) {
      await queryInterface.addColumn(
        "Profiles",
        "brandingFontColor",
        { type: Sequelize.STRING, allowNull: true, defaultValue: null },
        { transaction: t }
      );
    }
    if (!table.darkMode) {
      await queryInterface.addColumn(
        "Profiles",
        "darkMode",
        { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        { transaction: t }
      );
    }

    const Profiles = sequelize.define(
      "Profiles",
      {
        id: { type: Sequelize.INTEGER, primaryKey: true },
        templateId: Sequelize.INTEGER,
        modeId: Sequelize.INTEGER,
        brandingAccentColor: Sequelize.STRING,
        brandingBackGroundColor: Sequelize.STRING,
        brandingFontColor: Sequelize.STRING,
        darkMode: Sequelize.BOOLEAN,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
      },
      { tableName: "Profiles", timestamps: false }
    );

    // 2) Backfill from DeviceBrandings (latest by updatedAt/id per (profileId, templateId))
    // Only run if the table exists.
    const query = `SELECT 
  p.id AS profileId,
  db.id AS brandingId,
  db.templateId AS templateId,
  db.brandingAccentColor AS brandingAccentColor,
  db.brandingBackGroundColor AS brandingBackGroundColor,
  db.brandingFontColor AS brandingFontColor,
  db.darkMode AS darkMode,
  db.updatedAt AS updatedAt
FROM Profiles p
LEFT JOIN DeviceBrandings db
  ON p.id = db.profileId
  AND db.templateId = p.templateId
  AND db.id = (
    SELECT db2.id
    FROM DeviceBrandings db2
    WHERE db2.profileId = p.id
      AND db2.templateId = p.templateId
    ORDER BY db2.updatedAt DESC, db2.id DESC
    LIMIT 1
  )
ORDER BY p.id ASC;
`;
    const brandings = await queryInterface.sequelize.query(query, {
      transaction: t,
    });
    // console.log(brandings, "brandings");

    for (const branding of brandings[0]) {
      console.log(`Updating profile ${branding.profileId} branding...`);
      await Profiles.update(
        {
          brandingAccentColor: branding.brandingAccentColor || "#60449a",
          brandingBackGroundColor: branding.brandingBackGroundColor || null,
          brandingFontColor: branding.brandingFontColor || null,
        },
        { where: { id: branding.profileId } },
        { transaction: t }
      );
    }

    // 3) Drop DeviceBrandings table (if present)

     await queryInterface.dropTable("DeviceBrandings", { transaction: t });
  });
};
