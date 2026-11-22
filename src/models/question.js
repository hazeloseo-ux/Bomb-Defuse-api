// Model = the JavaScript view of ONE table. Column rules live in the migration.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Question',
    {
      question_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_set_id: { type: DataTypes.INTEGER, allowNull: false },
      question_type: { type: DataTypes.STRING(10), allowNull: false },
      question_text: { type: DataTypes.TEXT, allowNull: false },
      choice_a: { type: DataTypes.STRING(255), allowNull: false },
      choice_b: { type: DataTypes.STRING(255), allowNull: false },
      choice_c: { type: DataTypes.STRING(255), allowNull: false },
      choice_d: { type: DataTypes.STRING(255), allowNull: false },
      correct_index: { type: DataTypes.SMALLINT, allowNull: false },
    },
    { tableName: 'questions', timestamps: false }
  );