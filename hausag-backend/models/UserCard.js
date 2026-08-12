const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const UserCard = sequelize.define('UserCard', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false,
  },
  card_last_4: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  card_brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_on_card: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'user_cards',
  timestamps: false,
});

User.hasMany(UserCard, { foreignKey: 'user_id', as: 'cards' });
UserCard.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserCard;
