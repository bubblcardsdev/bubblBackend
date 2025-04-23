'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert(
      "CustomFontMasters",
      [
        {
          name: "Amenti",
        },
        {
          name: "Muller",
        },
        {
          name: "Romeliosans",
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
  }
};
