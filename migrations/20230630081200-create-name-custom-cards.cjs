"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("NameCustomCards", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      orderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Orders",
          key: "id",
        },
      },
      customName: {
        type: Sequelize.STRING,
      },
      fontStyle: {
        type: Sequelize.STRING,
      },
      isMailSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pdfImage: {
        type: Sequelize.STRING,
      },
      deviceInventorId: {
        type: Sequelize.INTEGER,
        references: {
          model: "NameCustomImages",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("NameCustomCards");
  },
};
