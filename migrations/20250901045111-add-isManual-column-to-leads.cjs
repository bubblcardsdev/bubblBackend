"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("LeadGens"); // or "Leads" depending on your actual table

    if (!table["isManual"]) {
      await queryInterface.addColumn("LeadGens", "isManual", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("LeadGens"); // or "Leads"

    if (table["isManual"]) {
      await queryInterface.removeColumn("LeadGens", "isManual");
    }
  },
};
