'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ContactUs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false, 
        
      },
      emailId: {
        type: Sequelize.STRING,
        allowNull:false, 
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull:false, 
      },
      question: {
        type: Sequelize.STRING,
        allowNull:false, 
      },
      message: {
        type: Sequelize.STRING,
        allowNull:true, 
      },
      isRead:{
      type: Sequelize.BOOLEAN,
      allowNull: false, 
      defaultValue:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ContactUs');
  }
};