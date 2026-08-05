const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  short_description: {
    type: DataTypes.TEXT,
  },
  long_description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
  },
  color: {
    type: DataTypes.STRING,
  },
  tag: {
    type: DataTypes.STRING, // e.g. "Nuevo", "Sin stock"
  },
  image_url: {
    type: DataTypes.STRING,
  }
}, {
  timestamps: true,
});

module.exports = Product;
