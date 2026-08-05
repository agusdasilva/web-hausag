const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeHausag() {
  try {
    const url = 'https://elaguilasanitarios.com.ar/?s=hausag&post_type=product';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const products = [];

    $('.product-small').each((i, el) => {
      const title = $(el).find('.product-title a').text().trim() || $(el).find('p.name.product-title a').text().trim();
      
      let imageUrl = $(el).find('.box-image img').attr('data-src') || $(el).find('.box-image img').attr('src');
      if (imageUrl && imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      }

      if (title) {
        products.push({
          title,
          imageUrl
        });
      }
    });

    console.log(`Encontrados ${products.length} productos.`);
    console.log(products.slice(0, 3));
    
  } catch (error) {
    console.error('Error scraping:', error.message);
  }
}

scrapeHausag();
