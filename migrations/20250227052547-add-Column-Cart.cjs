/* eslint-disable linebreak-style */
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Carts",
      "deviceId",
      {
        type: Sequelize.INTEGER,
        references:{
          model:"DeviceInventories",
          key:"id"
        }
      }
    );
  },
 

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
        "Carts",
        "deviceId"
      );
  },
};


