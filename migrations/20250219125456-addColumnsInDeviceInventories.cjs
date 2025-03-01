/* eslint-disable linebreak-style */
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "DeviceInventories",
      "discountPercentage",
      {
        type: Sequelize.INTEGER,
      }
    );
    await queryInterface.addColumn(
      "DeviceInventories",
      "deviceName",
      {
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      "DeviceInventories",
      "shortDescription",
      {
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      "DeviceInventories",
      "productDetails",
      {
        type: Sequelize.JSON,
      }
    );  
    await queryInterface.changeColumn(
      "DeviceInventories",
      "deviceImage",{
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      "DeviceInventories",
      "deviceColor",{
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      "DeviceInventories",
      "deviceDescription",{
        type: Sequelize.STRING (6000),
        allowNull: true,
      }
    );
    await queryInterface.removeIndex("DeviceInventories", "Composite_Key");

    // the new unique constraint that includes deviceName, deviceType, and deviceColor
    await queryInterface.addIndex("DeviceInventories", ["deviceType", "deviceColor", "deviceName"], {
      unique: true,
      name: "Composite_Key"
    });
 
  },
 

 
};


