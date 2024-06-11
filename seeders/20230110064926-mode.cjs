"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "Modes",
      [
        {
          mode: "Contact Card",
        },
        {
          mode: "Bubbl Profile",
        },
        {
          mode: "Direct URL",
        },
        {
          mode: "Lead Form",
        },
      ],
      { fields: ["mode"], ignoreDuplicates: true }
    );
  },
};
