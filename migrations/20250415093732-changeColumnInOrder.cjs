"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "orderStatus", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Orders", "totalPrice", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("Orders", "deliveryBy", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "orderStatus", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Orders", "totalPrice", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("Orders", "deliveryBy", {
      type: Sequelize.STRING,
      allowNull: false,

    });
  },
};
