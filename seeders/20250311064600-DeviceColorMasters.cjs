"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "DeviceColorMasters",
      [
        {
          name: "Citroen green",
        },
        {
          name: "Ruby red",
        },
        {
          name: "red",
        },
        {
          name: "white",
        },
        {
          name: "Pitch black",
        },
        {
          name: "Sapphire blue",
        },
        {
          name: "Flame orange",
        },
        {
          name: "Deep purple",
        },
        {
          name: "Chalk white",
        },
        {
          name: "Yellow",
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
