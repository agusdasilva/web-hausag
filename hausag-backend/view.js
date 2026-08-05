const sequelize = require('./db');
const Product = require('./models/Product');

async function view() {
  const products = await Product.findAll();
  console.log(JSON.stringify(products, null, 2));
}

view();
