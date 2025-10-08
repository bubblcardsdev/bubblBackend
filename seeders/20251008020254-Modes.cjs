'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert(
      "Modes",
      [
        {
          name: "Bubbl Profile",
        },
        {
          name: "Custom Url",
        },
      ],
      { fields: ["name"], ignoreDuplicates: true }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Modes', null, {});
  }
};
