

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("PromoCodes");


    if(!table["newUser"]){
      await queryInterface.addColumn("PromoCodes", "newUser", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },


  async down(queryInterface) {
    const table = await queryInterface.describeTable("PromoCodes");

    if(table["newUser"]){
      await queryInterface.removeColumn("PromoCodes", "newUser");
    }
  },
};
