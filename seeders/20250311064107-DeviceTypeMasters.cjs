"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "DeviceTypeMasters",
      [
        {
          name: "Card",
        },
        {
          name: "Socket",
        },
        {
          name: "Tile",
        },
        {
          name: "Bundle Devices",
        },
        {
          name: "Full Custom",
        },
        {
          name: "Name Custom",
        },
        {
          name: "Wrist Band",
        },
        {
          name: "Standee",
        },
      ],
      { fields: ["name"], ignoreDuplicates: true }
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
