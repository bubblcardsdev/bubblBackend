'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class MaterialTypeMaster extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MaterialTypeMaster.init({
     name: {
        type: Sequelize.STRING
      },
  }, {
    sequelize,
    modelName: 'MaterialTypeMaster',
  });
  return MaterialTypeMaster;
};