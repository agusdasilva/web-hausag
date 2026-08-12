const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');
const Product = require('./models/Product');
const User = require('./models/User');
const UserCard = require('./models/UserCard');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'hausag_super_secret_key_2026';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir imágenes descargadas por el scraper
const imageDir = path.join(__dirname, '..', 'hausag-frontend', 'public', 'assets', 'images', 'productos');
app.use('/productos', express.static(imageDir));

// Obtener todos los productos (con filtros opcionales)
app.get(['/api/products', '/api/products.php'], async (req, res) => {
  try {
    // Si viene ?id= en /products.php, devolver uno solo
    if (req.query.id) {
      const product = await Product.findByPk(req.query.id);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.json(product);
    }

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

// Obtener producto por ID (ruta antigua para Node)
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

// Middleware de Autenticación
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Rutas de Autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { first_name, last_name, email, dni, password } = req.body;
    
    // Validar duplicados
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ error: 'El email ya está registrado' });
    
    const existingDni = await User.findOne({ where: { dni } });
    if (existingDni) return res.status(400).json({ error: 'El DNI ya está registrado' });
    
    const password_hash = await bcrypt.hash(password, 10);
    
    const user = await User.create({ first_name, last_name, email, dni, password_hash });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, first_name, last_name, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Credenciales inválidas' });
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de Perfil
app.get('/api/user/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash', 'dni'] },
      include: [{ model: UserCard, as: 'cards' }]
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, description, email, current_password, new_password } = req.body;
    const user = await User.findByPk(req.userId);
    
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ error: 'El email ya está en uso' });
      user.email = email;
    }
    
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (description !== undefined) user.description = description;
    
    if (current_password && new_password) {
      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
      user.password_hash = await bcrypt.hash(new_password, 10);
    }
    
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de Tarjetas
app.post('/api/user/cards', authenticate, async (req, res) => {
  try {
    const { card_number, name_on_card } = req.body;
    
    // Simulate detecting brand and getting last 4 digits
    const card_last_4 = card_number.slice(-4);
    const firstDigit = card_number.charAt(0);
    let card_brand = 'Desconocida';
    if (firstDigit === '4') card_brand = 'Visa';
    else if (firstDigit === '5') card_brand = 'Mastercard';
    else if (firstDigit === '3') card_brand = 'Amex';
    
    const card = await UserCard.create({
      user_id: req.userId,
      card_last_4,
      card_brand,
      name_on_card
    });
    
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/user/cards/:id', authenticate, async (req, res) => {
  try {
    const card = await UserCard.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!card) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    
    await card.destroy();
    res.json({ success: true });
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
