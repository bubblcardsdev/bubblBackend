const { allow } = require("joi");
const { uniq } = require("lodash");
const { default: plan } = require("../../models/plan.cjs");

module.exports = async (sequelize, Sequelize) => {
  const { Op } = Sequelize;

  // Minimal model definitions (no schema changes)
  const Plans = sequelize.define(
    "Plans",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      planName: { type: Sequelize.STRING, allowNull: false, unique: true },
      monthlyPrice: { type: Sequelize.INTEGER, allowNull: false },
      annualPrice: { type: Sequelize.INTEGER, allowNull: false },
      shortDescription: { type: Sequelize.STRING, allowNull: false },
    },
    { tableName: "Plans", timestamps: false }
  );

  const PlanDescriptions = sequelize.define(
    "PlanDescriptions",
    {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      planId: { type: Sequelize.INTEGER, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
    },
    { tableName: "PlanDescriptions", timestamps: false }
  );

  await Plans.update(
    {
      shortDescription: "Perfect for students and Individual Professionals",
      planName: "Free",
    },
    { where: { id: 1 } }
  );

  await Plans.update(
    { shortDescription: "For professionals and creators", planName: "Pro" },
    { where: { id: 2 } }
  );

  await Plans.update(
    {
      shortDescription: "For startups, agencies & enterprises",
      planName: "Teams",
    },
    { where: { id: 3 } }
  );

  console.log("Plans updated");
  await PlanDescriptions.bulkCreate([
    { planId: 1, description: "Digital profile with QR code" },
    { planId: 1, description: "Unlimited shares" },
    { planId: 1, description: "Basic analytics" },
    { planId: 1, description: "Email support" },
    { planId: 2, description: "1 NFC-enabled Bubbl device" },
    { planId: 2, description: "Advanced analytics dashboard" },
    { planId: 2, description: "Lead capture form" },
    { planId: 2, description: "Customizable profile" },
    { planId: 2, description: "Priority support" },
    { planId: 3, description: "Multiple NFC devices per user" },
    { planId: 3, description: "Admin dashboard & team controls" },
    { planId: 3, description: "Role-based access" },
    { planId: 3, description: "Centralized analytics" },
    { planId: 3, description: "API access & CRM sync" },
    { planId: 3, description: "Dedicated account manager" },
    { planId: 3, description: "White-labeling available" },
  ]);

  console.log("PlanDescriptions updated");
};

module.exports.config = { transaction: true };
