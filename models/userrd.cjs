'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class UserRD extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserRD.init({
    Name: {
      type: Sequelize.STRING,
    },
    UID: {
      type: Sequelize.STRING,
    },
    AuthorizedTime: {
      type: Sequelize.DATE,
    },
  }, {
    sequelize,
    modelName: 'UserRD',
  });
  return UserRD;
};