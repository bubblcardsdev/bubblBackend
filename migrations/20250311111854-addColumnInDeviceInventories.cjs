"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("DeviceInventories", "fontId", {
      type: Sequelize.INTEGER,
      references: {
        model: "CustomFontMasters",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
     await queryInterface.removeColumn("DeviceInventories", "fontId");
  },
};
