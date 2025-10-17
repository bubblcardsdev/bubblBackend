"use strict";

const { col } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "DeviceColorMasters",
      [
        {
          name: "Citroen green",
          colorCode: "#BACD4F",
        },
        {
          name: "Ruby red",
          colorCode: "#BF2D2D",
        },
        {
          name: "red",
          colorCode:"#BC0412"
        },
        {
          name: "white",
          colorCode: "#d1d3d4",
        },
        {
          name: "Pitch black",
          colorCode: "#161616"
        },
        {
          name: "Sapphire blue",
          colorCode: "#317987"
        },
        {
          name: "Flame orange",
          colorCode: "#EC872C"
        },
        {
          name: "Deep purple",
          colorCode: "#8E4EA0"
        },
        {
          name: "Chalk white",
          colorCode: "#d1d3d4"
        },
        {
          name: "Yellow",
          colorCode: "#EFC336"
        },
      ],
      { fields: ["name"], ignoreDuplicates: true }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("DeviceColorMasters", null, {});
  },
};
