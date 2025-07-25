"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (!table["apple"]) {
      queryInterface.addColumn("Users", "apple", {
        type: Sequelize.BOOLEAN,
          defaultValue: false,
        allowNull: false, 
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (table["colorCode"]) {
      await queryInterface.removeColumn("Users", "apple");
    }
  },
};
