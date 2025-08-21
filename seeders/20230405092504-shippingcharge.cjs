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

    // await queryInterface.bulkInsert(
    //   "ShippingCharges",
    //   [
    //     {
    //       country: "india",
    //       amount: "100",
    //     },
    //     {
    //       country: "others",
    //       amount: "500",
    //     },
    //   ],
    //   { fields: ["country"], ignoreDuplicates: true }
    // );
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
