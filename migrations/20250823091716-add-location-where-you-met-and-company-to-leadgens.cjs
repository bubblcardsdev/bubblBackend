'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('LeadGens', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('LeadGens', 'where_you_met', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('LeadGens', 'company', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('LeadGens', 'location');
    await queryInterface.removeColumn('LeadGens', 'where_you_met');
    await queryInterface.removeColumn('LeadGens', 'company');
  },
};
