const { Op, where } = require("sequelize");

module.exports = async (sequelize, Sequelize) => {
  // --- 1. Define models ---

  const ProfileSocialMediaLinks = sequelize.define(
    "ProfileSocialMediaLinks",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      profileId: Sequelize.INTEGER,
      profileSocialMediaId: Sequelize.INTEGER,
      socialMediaName: Sequelize.STRING,
      enableStatus: Sequelize.BOOLEAN,
      activeStatus: Sequelize.BOOLEAN,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    { tableName: "ProfileSocialMediaLinks", timestamps: false }
  );

  const ProfileDigitalPaymentLinks = sequelize.define(
    "ProfileDigitalPaymentLinks",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      profileId: Sequelize.INTEGER,
      profileDigitalPaymentsId: Sequelize.INTEGER,
      digitalPaymentLink: Sequelize.STRING,
      enableStatus: Sequelize.BOOLEAN,
      activeStatus: Sequelize.BOOLEAN,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    { tableName: "ProfileDigitalPaymentLinks", timestamps: false }
  );

  const ProfileWebsites = sequelize.define(
    "ProfileWebsites",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      profileId: Sequelize.INTEGER,
      website: Sequelize.STRING,
      websiteType: Sequelize.STRING,
      checkBoxStatus: Sequelize.BOOLEAN,
      activeStatus: Sequelize.BOOLEAN,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    { tableName: "ProfileWebsites", timestamps: false }
  );

  const ProfileEmails = sequelize.define(
    "ProfileEmails",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      profileId: Sequelize.INTEGER,
      emailId: Sequelize.STRING,
      emailType: Sequelize.STRING,
      checkBoxStatus: Sequelize.BOOLEAN,
      activeStatus: Sequelize.BOOLEAN,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    { tableName: "ProfileEmails", timestamps: false }
  );

  const ProfilePhoneNumbers = sequelize.define(
    "ProfilePhoneNumbers",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      profileId: Sequelize.INTEGER,
      phoneNumberType: Sequelize.STRING,
      countryCode: Sequelize.STRING,
      phoneNumber: Sequelize.STRING,
      checkBoxStatus: Sequelize.BOOLEAN,
      activeStatus: Sequelize.BOOLEAN,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    { tableName: "ProfilePhoneNumbers", timestamps: false }
  );

   const queryInterface = sequelize.getQueryInterface();

  // --- 2. Define a helper for deletion logs ---

  async function deleteEmptyRecords(model, field, label) {
    const empty = await model.findAll({
      where: { [field]: { [Op.or]: [null, ""] } },
    });
    console.log(`${label} — Empty records found: ${empty.length}`);
    for (const row of empty) {
      await model.destroy({ where: { id: row.id } });
      console.log(
        `Deleted empty record for profileId: ${row.profileId}, id: ${row.id}`
      );
    }
    console.log(`${label} — Empty records deleted count: ${empty.length}\n`);
  }

  // --- 3. Perform cleanup ---

  await deleteEmptyRecords(
    ProfileSocialMediaLinks,
    "socialMediaName",
    "Social Media Links"
  );
  await deleteEmptyRecords(
    ProfileDigitalPaymentLinks,
    "digitalPaymentLink",
    "Digital Payment Links"
  );
  await deleteEmptyRecords(ProfileWebsites, "website", "Websites");
  await deleteEmptyRecords(ProfileEmails, "emailId", "Emails");
  await deleteEmptyRecords(ProfilePhoneNumbers, "phoneNumber", "Phone Numbers");

  console.log("✅ Cleanup completed for all profile-related tables!");

  // update default types for mobile and email and wesite

  await ProfilePhoneNumbers.update(
    {
      phoneNumberType: "Personal",
    },
    {
      where: {
        phoneNumberType: { [Op.or]: [null, ""] },
      },
    }
  );

  // await queryInterface.removeColumn("ProfileWebsites", "websiteType");
  // await queryInterface.removeColumn("ProfileEmails", "emailType");
};
