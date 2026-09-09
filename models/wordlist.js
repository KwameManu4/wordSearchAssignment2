'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WordList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      WordList.hasMany(models.Word, {foreignKey: 'wordListId'});
      WordList.hasMany(models.ActivitySetting, {foreignKey: 'wordListId'})
    }
  }
  WordList.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'WordList',
  });
  return WordList;
};