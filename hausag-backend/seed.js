const sequelize = require('./db');
const Product = require('./models/Product');

const dummyProducts = [
  {
    title: 'Grifería de Cocina Monocomando Cisne',
    sku: 'GRIF-COC-001',
    short_description: 'Monocomando de cocina con cuello cisne flexible.',
    long_description: 'Grifería de cocina de alta calidad con acabado brillante. Su diseño monocomando permite regular fácilmente el caudal y la temperatura del agua. Cuello flexible para mayor comodidad.',
    category: 'Grifería de Cocina',
    color: 'Cromo',
    tag: 'Nuevo',
    image_url: 'https://via.placeholder.com/600x600?text=Griferia+Cocina'
  },
  {
    title: 'Grifería de Baño para Lavatorio',
    sku: 'GRIF-BAN-001',
    short_description: 'Grifería corta para baño estilo minimalista.',
    long_description: 'Cuerpo metálico resistente y diseño cuadrado minimalista ideal para baños modernos.',
    category: 'Grifería de Baño Corta',
    color: 'Negro Mate',
    tag: '',
    image_url: 'https://via.placeholder.com/600x600?text=Griferia+Baño+Negra'
  },
  {
    title: 'Radiador de Calefacción 5 Elementos',
    sku: 'CAL-RAD-005',
    short_description: 'Radiador de aluminio inyectado de 5 elementos.',
    long_description: 'Máxima eficiencia térmica con un diseño elegante y compacto. Preparado para sistemas de calefacción por caldera.',
    category: 'Calefacción',
    color: 'Blanco',
    tag: 'Sin stock',
    image_url: 'https://via.placeholder.com/600x600?text=Radiador'
  }
];

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset DB
    console.log('Database synced (force: true)');
    
    await Product.bulkCreate(dummyProducts);
    console.log('Dummy products inserted!');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed:', error);
    process.exit(1);
  }
};

seed();
