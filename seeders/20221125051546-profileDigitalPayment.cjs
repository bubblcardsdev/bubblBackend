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
    //   "ProfileDigitalPayments",
    //   [
    //     {
    //       digitalPaymentIcon: "payment icon",
    //       digitalPaymentLabel: "google pay",
    //     },
    //     {
    //       digitalPaymentIcon: "payment icon",
    //       digitalPaymentLabel: "phonepe",
    //     },
    //     {
    //       digitalPaymentIcon: "payment icon",
    //       digitalPaymentLabel: "paytm",
    //     },
    //   ],
    //   { fields: ["digitalPaymentLabel"], ignoreDuplicates: true }
    // );
  },
};
