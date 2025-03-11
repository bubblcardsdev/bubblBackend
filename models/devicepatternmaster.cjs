'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class DevicePatternMaster extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DevicePatternMaster.init({
    name: {
        type: Sequelize.STRING
      },
  }, {
    sequelize,
    modelName: 'DevicePatternMaster',
  });
  return DevicePatternMaster;
};