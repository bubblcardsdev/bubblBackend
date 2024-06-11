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
      "ProfileSocialMedia",
      [
        {
          socialMediaIcon: "icon",
          socialMediaLabel: "instagram",
        },
        {
          socialMediaIcon: "icon",
          socialMediaLabel: "facebook",
        },
        {
          socialMediaIcon: "icon",
          socialMediaLabel: "twitter",
        },
        {
          socialMediaIcon: "icon",
          socialMediaLabel: "youtube",
        },
        {
          socialMediaIcon: "icon",
          socialMediaLabel: "linkedin",
        },
      ],
      { fields: ["socialMediaLabel"], ignoreDuplicates: true }
    );
  },
};
