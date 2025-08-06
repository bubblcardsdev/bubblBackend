"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Profiles");

    if (!table["profileUid"]) {
      await queryInterface.addColumn("Profiles", "profileUid", {
        type: Sequelize.UUID,
        allowNull: true, 
        unique: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Profiles");

    if (table["profileUid"]) {
      await queryInterface.removeColumn("Profiles", "profileUid");
    }
  },
};
