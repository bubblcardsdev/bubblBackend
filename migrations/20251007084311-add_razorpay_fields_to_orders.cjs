'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'razorpayOrderId', {
      type: Sequelize.STRING,
      allowNull: true, // keep null for old orders
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'razorpayOrderId');
  }
};