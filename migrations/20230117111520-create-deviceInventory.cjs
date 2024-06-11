"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DeviceInventories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      deviceType: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      deviceColor: {
        type: Sequelize.STRING,
        allowNull: false,
        unique:false,
      },
      deviceImage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deviceDescription: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      availability: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },{
      uniqueKeys:{
        Composite_Key:{
          fields:["deviceType","deviceColor"]
        }
      }
    });
  },
  async down(queryInterface,) {
    await queryInterface.dropTable("DeviceInventories");
  },
};
