'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Word extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Word.belongsTo(models.WordList, {foreignKey: 'wordListId'});
      Word.hasMany(models.Phoneme, {foreignKey:'wordId'})
      
    }
  }
  Word.init({
    english: DataTypes.STRING,
    wordListId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Word',
  });
  return Word;
};