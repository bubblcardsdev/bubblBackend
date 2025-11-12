// <timestamp>-add-promocode-tables-and-orders-fk.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) PromoCodeTypes
    await queryInterface.createTable("PromoCodeTypes", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true }, // e.g., PERCENT, FLAT, FREE_QUANTITY
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") }
    });

    // Seed common types (optional but handy)
    await queryInterface.bulkInsert("PromoCodeTypes", [
      { name: "PERCENT", createdAt: new Date(), updatedAt: new Date() },
      { name: "FLAT", createdAt: new Date(), updatedAt: new Date() },
      { name: "FREE_QUANTITY", createdAt: new Date(), updatedAt: new Date() }
    ]);

    // 2) PromoCodes
    await queryInterface.createTable("PromoCodes", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: Sequelize.STRING(64), allowNull: false, unique: true }, // unique code
      description: { type: Sequelize.STRING(255), allowNull: true },

      // What kind of offer this is (FK to PromoCodeTypes)
      offerTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "PromoCodeTypes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },

      // Value semantics depend on type:
      // - PERCENT: 0..100 (INTEGER recommended)
      // - FLAT: currency amount (DECIMAL)
      // - FREE_QUANTITY: number of free items (INTEGER)
      offerValue: { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
      // Constraints
      minValue: { type: Sequelize.DECIMAL(10,2), allowNull: true },      // minimum order value to apply (pre-shipping)
      minQuantity: { type: Sequelize.INTEGER, allowNull: true },         // minimum total quantity across cart
      freeQuantity: { type: Sequelize.INTEGER, allowNull: true },        // for FREE_QUANTITY
      maxAmount: { type: Sequelize.DECIMAL(10,2), allowNull: true },     // cap on discount amount
      maxUses: { type: Sequelize.INTEGER, allowNull: true },             // total global uses across all users

      // Lifecycle
      expireAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") }
    });

    await queryInterface.addIndex("PromoCodes", ["code"], { unique: true, name: "uk_promocodes_code" });

    // 3) PromoCodeUsages
    await queryInterface.createTable("PromoCodeUsages", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      promoCodeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "PromoCodes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      email: { type: Sequelize.STRING(255), allowNull: true },
      usedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") }
    });

    await queryInterface.addIndex("PromoCodeUsages", ["promoCodeId"], { name: "idx_promocodeusages_promocodeid" });
    await queryInterface.addIndex("PromoCodeUsages", ["customerId"], { name: "idx_promocodeusages_customerid" });

    // 4) Orders → add promoCodeId (nullable, preserved naming)
    await queryInterface.addColumn("Orders", "promoCodeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "PromoCodes", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      after: "shippingCharge"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Orders", "promoCodeId");
    await queryInterface.dropTable("PromoCodeUsages");
    await queryInterface.dropTable("PromoCodes");
    await queryInterface.dropTable("PromoCodeTypes");
  }
};
