"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.bulkInsert(
    //   "ActionLookUps",
    //   [
    //     {
    //       actionName: "Tap",
    //     },
    //     {
    //       actionName: "Leads",
    //     },
    //     {
    //       actionName: "Contact",
    //     },
    //     {
    //       actionName: "Phone",
    //     },
    //     {
    //       actionName: "Email",
    //     },
    //     {
    //       actionName: "Website",
    //     },
    //     {
    //       actionName: "Location",
    //     },
    //     {
    //       actionName: "Instagram",
    //     },
    //     {
    //       actionName: "Linkedin",
    //     },
    //     {
    //       actionName: "Twitter",
    //     },
    //     {
    //       actionName: "FaceBook",
    //     },
    //     {
    //       actionName: "Youtube",
    //     },
    //     {
    //       actionName: "Gpay",
    //     },
    //     {
    //       actionName: "Phonepe",
    //     },
    //     {
    //       actionName: "paytm",
    //     },
    //     {
    //       actionName: "QR",
    //     },
    //   ],
    //   { fields: ["actionName"], ignoreDuplicates: true }
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
