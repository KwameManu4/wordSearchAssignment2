'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PageVisit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PageVisit.init({
    page: DataTypes.STRING,
    durationSeconds: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PageVisit',
  });
  return PageVisit;
};