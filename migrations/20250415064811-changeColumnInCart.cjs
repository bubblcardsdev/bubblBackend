"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Carts", "productColor", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Carts", "productPrice", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("Carts", "productType", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Carts", "productColor", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Carts", "productPrice", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("Carts", "productType", {
      type: Sequelize.STRING,
      allowNull: false,

    });
  },
};
