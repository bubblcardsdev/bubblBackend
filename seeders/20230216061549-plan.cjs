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
      "Plans",
      [
        {
          planName: "bubblFree",
          monthlyPrice: 0,
          annualPrice: 0,
        },
        {
          planName: "bubblPro",
          monthlyPrice: 500,
          annualPrice: 1500,
        },
        {
          planName: "bubblCustom",
          monthlyPrice: 0,
          annualPrice: 0,
        },
      ],
      { fields: ["planName"], ignoreDuplicates: true }
    );
  },
};
