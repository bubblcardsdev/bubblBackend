'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert(
      "OrderStatusMasters",
      [
        {
          name: "Created",
        },
        {
          name: "Cancelled",
        },
        {
          name: "Paid",
        },
        {
          name: "Failure",
        },
        {
          name: "Shipped",
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
