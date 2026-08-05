const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir imágenes descargadas por el scraper
const imageDir = path.join(__dirname, '..', 'hausag-frontend', 'public', 'assets', 'images', 'productos');
app.use('/productos', express.static(imageDir));

// Obtener todos los productos (con filtros opcionales)
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, color } = req.query;
    const where = {};
    
    if (category) where.category = category;
    if (color) where.color = color;
    
    // Simplistic search for SQLite
    if (search) {
      where.title = {
        [require('sequelize').Op.like]: `%${search}%`
      };
    }

    const products = await Product.findAll({ where });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener producto por ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync and start
sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync db:', err);
});
