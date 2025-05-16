"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("DeviceInventories", "materialTypeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "MaterialTypeMasters",
        key: "id",
      },
    });
    await queryInterface.changeColumn("DeviceInventories", "patternId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "DevicePatternMasters",
        key: "id",
      },
    });
    await queryInterface.changeColumn("DeviceInventories", "colorId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "DeviceColorMasters",
        key: "id",
      },
    });
    await queryInterface.changeColumn("DeviceInventories", "deviceTypeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "DeviceTypeMasters",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("DeviceInventories", "fontId");
  },
};
