// Model = the JavaScript view of ONE table. Column rules live in the migration.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Answer',
    {
      answer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      player_id: { type: DataTypes.INTEGER, allowNull: false },
      question_id: { type: DataTypes.INTEGER, allowNull: false },
      choice_index: { type: DataTypes.SMALLINT, allowNull: false },
      correct: { type: DataTypes.BOOLEAN, allowNull: false },
      points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      answered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'answers', timestamps: false }
  );