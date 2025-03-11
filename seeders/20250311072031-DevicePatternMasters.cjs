'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert(
      "DevicePatternMasters",
      [
        {
          name: "darkGreyPattern",
        },
        {
          name: "greenPattern",
        },
        {
          name: "purplePattern",
        },
        {
          name: "lightGreyPattern",
        },
        {
          name: "orangePattern",
        },
        {
          name: "greyPattern",
        },
        {
          name: "blackPattern",
        },
        {
          name: "redPattern",
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
