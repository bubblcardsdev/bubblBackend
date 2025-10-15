"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "DevicePatternMasters",
      [
        {
          name: "zebraGrey",
        },
        {
          name: "sonicGreen",
        },
        {
          name: "purpleCarrara",
        },
        {
          name: "pixelComb",
        },
        {
          name: "maze",
        },
        {
          name: "princeCout",
        },
        {
          name: "blackPattern",
        },
        {
          name: "bikanerRed",
        },
        {
          name: "yugataRed",
        },
        {
          name: "tithoniaRed",
        },
        {
          name: "umiWhite",
        },
        {
          name: "nongyeWhite",
        },
        {
          name: "neckerCube",
        },
        {
          name: "poggendorff",
        },
        {
          name: "AlmondGold",
        },
        {
          name: "starOfBethlehem",
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
