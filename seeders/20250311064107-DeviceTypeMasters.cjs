"use strict";



/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "DeviceTypeMasters",
      [
        {
          name: "Card",
          version: 1,
        },
        {
          name: "Socket",
          version: 1,
        },
        {
          name: "Tile",
          version: 1,
        },
        {
          name: "Bundle Devices",
          version: 1,
        },
        {
          name: "Full Custom",
          version: 1,
        },
        {
          name: "Name Custom",
          version: 1,
        },
      ],
      { fields: ["name","version"], ignoreDuplicates: true }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
