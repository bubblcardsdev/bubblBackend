'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderBreakDown extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderBreakDown.init({
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    originalPrice: DataTypes.INTEGER,
    discountedPrice: DataTypes.INTEGER,
    discountedAmount: DataTypes.INTEGER,
    sellingPrice: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrderBreakDown',
  });
  return OrderBreakDown;
};