"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Plans");

    if (!table["shortDescription"]) {
      await queryInterface.addColumn("Plans", "shortDescription", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!table["monthlyDiscount"]) {
      await queryInterface.addColumn("Plans", "monthlyDiscount", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
    if (!table["annualDiscount"]) {
      await queryInterface.addColumn("Plans", "annualDiscount", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
    if (!table["isActive"]) {
      await queryInterface.addColumn("Plans", "isActive", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Plans");

    if (table["shortDescription"]) {
      await queryInterface.removeColumn("Plans", "shortDescription");
    }
    if (table["monthlyDiscount"]) {
      await queryInterface.removeColumn("Plans", "monthlyDiscount");
    }
     if (table["annualDiscount"]) {
      await queryInterface.removeColumn("Plans", "annualDiscount");
    }
    if (table["isActive"]) {
      await queryInterface.removeColumn("Plans", "isActive");
    }
  },
};
