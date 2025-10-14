"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Payments");


    if(!table["encResponse"]){
      await queryInterface.addColumn("Payments", "encResponse", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },


  async down(queryInterface) {
    const table = await queryInterface.describeTable("Payments");

    if(table["encResponse"]){
      await queryInterface.removeColumn("Payments", "encResponse");
    }
  },
};
