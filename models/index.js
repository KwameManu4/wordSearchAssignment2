'use strict';

const Sequelize = require('sequelize');
const config = require('../config/config.json');

const env = process.env.NODE_ENV || 'development';
const envConfig = config[env];

const db = {};

let sequelize;
if (envConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[envConfig.use_env_variable], envConfig);
} else {
  sequelize = new Sequelize(
    envConfig.database,
    envConfig.username,
    envConfig.password,
    envConfig
  );
}

// Static requires so the bundler (Turbopack/webpack) can resolve every model.
// Add a line here whenever you add a model file.
const modelDefiners = [
  require('./wordlist'),
  require('./word'),
  require('./phoneme'),
  require('./activitysetting'),
  require('./generationevent'),
  require('./pagevisit')
];

for (const defineModel of modelDefiners) {
  const model = defineModel(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
