"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Orders"); 
    const table2 = await queryInterface.describeTable("Payments");

    if (!table["isPlan"]) {
      await queryInterface.addColumn("Orders", "isPlan", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
    if(!table["planId"]){
      await queryInterface.addColumn("Orders", "planId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }
    if(!table["planType"]){
      await queryInterface.addColumn("Orders", "planType", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
    }

    if(!table2["encResponse"]){
      await queryInterface.addColumn("Payments", "encResponse", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },


  async down(queryInterface) {
    const table = await queryInterface.describeTable("Orders");
    const table2 = await queryInterface.describeTable("Payments");

    if (table["isPlan"]) {
      await queryInterface.removeColumn("Orders", "isPlan");
    }
    if(table["planId"]){
      await queryInterface.removeColumn("Orders", "planId");
    }
    if(table["planType"]){
      await queryInterface.removeColumn("Orders", "planType");
    }
    if(table2["encResponse"]){
      await queryInterface.removeColumn("Payments", "encResponse");
    }
  },
};
