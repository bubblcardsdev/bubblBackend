"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    queryInterface.addColumn("Profiles", "templateId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      references: {
        model: "Templates",
        key: "id",
      },
    }),
      queryInterface.addColumn("Profiles", "modeId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        references: {
          model: "Modes",
          key: "id",
        },
      });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
