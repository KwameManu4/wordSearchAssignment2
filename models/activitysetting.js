'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActivitySetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ActivitySetting.belongsTo(models.WordList, {foreignKey:'wordListId'})
    }
  }
  ActivitySetting.init({
    type: DataTypes.ENUM('wordle', 'wordsearch'),
    difficulty: DataTypes.ENUM('easy', 'medium', 'hard'),
    hintsEnabled: DataTypes.BOOLEAN,
    wordListId: DataTypes.INTEGER,
    gridSize: DataTypes.INTEGER,
    maxGuesses: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ActivitySetting',
  });
  return ActivitySetting;
};