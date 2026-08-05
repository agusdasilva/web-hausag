const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function scrapeHausagProducts() {
  const searchUrl = 'https://elaguilasanitarios.com.ar/?s=hausag&post_type=product';
  console.log('Fetching search results...');
  const res = await fetch(searchUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  const productLinks = [];
  $('a.woocommerce-LoopProduct-link').each((i, el) => {
    productLinks.push($(el).attr('href'));
  });

  const uniqueLinks = [...new Set(productLinks)];
  console.log(`Found ${uniqueLinks.length} products to scrape.`);

  const products = [];

  for (const link of uniqueLinks) {
    console.log(`Scraping: ${link}`);
    try {
      const pRes = await fetch(link);
      const pHtml = await pRes.text();
      const $p = cheerio.load(pHtml);

      const title = $p('h1.product_title').text().trim();
      const sku = $p('.sku').text().trim() || 'N/A';
      const shortDesc = $p('.woocommerce-product-details__short-description').text().trim();
      const longDesc = $p('#tab-description').text().trim();

      products.push({
        title,
        sku,
        shortDesc,
        longDesc,
        url: link
      });
    } catch (e) {
      console.error(`Error scraping ${link}:`, e.message);
    }
  }

  const fs = require('fs');
  fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf8');
  console.log('Saved to products.json');
}

scrapeHausagProducts();
