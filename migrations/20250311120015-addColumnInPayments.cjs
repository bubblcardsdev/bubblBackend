"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Payments", "amount", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Payments", "paymentMethod", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Payments", "isLoggedIn", {
      type: Sequelize.BOOLEAN,
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Payments", "amount");
    await queryInterface.removeColumn("Payments", "paymentMethod");
    await queryInterface.removeColumn("Payments", "isLoggedIn");
  },
};
