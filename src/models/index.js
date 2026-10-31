// ONE Sequelize instance (one connection pool) for the whole API.
// Every other file imports it from here - nobody opens a second one.
const { Sequelize, DataTypes } = require('sequelize');
const env = require('../config/env');
const dbConfig = require('../config/database')[env.nodeEnv];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Models: one line each.
const User = require('./user')(sequelize, DataTypes);
const QuestionSet = require('./question-set')(sequelize, DataTypes);

// Associations: one host has many question sets.
User.hasMany(QuestionSet, { foreignKey: 'host_id' });
QuestionSet.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

module.exports = { sequelize, Sequelize, DataTypes, User, QuestionSet };