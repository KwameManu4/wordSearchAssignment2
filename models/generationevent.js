'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GenerationEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GenerationEvent.init({
    activityType: DataTypes.ENUM,
    status: DataTypes.ENUM,
    failureReason: DataTypes.STRING,
    wordListId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GenerationEvent',
  });
  return GenerationEvent;
};