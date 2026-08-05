const sequelize = require('./db');
const Product = require('./models/Product');
const fs = require('fs');

async function updateDB() {
  const scrapedData = JSON.parse(fs.readFileSync('products.json', 'utf8'));

  for (const scraped of scrapedData) {
    // Find the product in the DB by title
    const dbProduct = await Product.findOne({ where: { title: scraped.title } });

    if (dbProduct) {
      // Update fields
      // Use scraped SKU if available, otherwise keep old
      const finalSku = (scraped.sku && scraped.sku !== 'N/A') ? scraped.sku : dbProduct.sku;
      
      const shortDesc = scraped.shortDesc || dbProduct.short_description;
      const longDesc = scraped.longDesc || dbProduct.long_description;

      await dbProduct.update({
        sku: finalSku,
        short_description: shortDesc,
        long_description: longDesc
      });
      
      console.log(`Updated: ${scraped.title} - SKU: ${finalSku}`);
    } else {
      console.log(`Not found in DB: ${scraped.title}`);
    }
  }
}

updateDB().then(() => {
  console.log('Update finished!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
