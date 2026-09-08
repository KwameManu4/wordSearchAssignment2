'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Phoneme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Phoneme.belongsTo(models.Word, {foreignKey:'wordId'})
    }
  }
  Phoneme.init({
    symbol: DataTypes.STRING,
    wordId: DataTypes.INTEGER,
    position: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Phoneme',
  });
  return Phoneme;
};