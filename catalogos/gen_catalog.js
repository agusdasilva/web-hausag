const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const IMG = 'C:/Users/Usuario/Documents/Hausag/hausag_produccion/assets/images/productos/';
const USER_IMG = 'C:/Users/Usuario/.gemini/antigravity/brain/c281b4d0-f7f7-4531-8d82-dcf22aa7adcd/.user_uploaded/media_1789056881298.jpg';

function b64(p) {
  const ext = path.extname(p).toLowerCase();
  const mime = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : 'image/png';
  return 'data:' + mime + ';base64,' + fs.readFileSync(p).toString('base64');
}

const products = [
  { name: 'Stick Line Monocomando Cromo',        code: '067251', img: IMG + '067251.png' },
  { name: 'Design Black Monocomando',            code: '067252', img: IMG + '067252.jpg' },
  { name: 'Monocomando Cromo Cocina',            code: '067253', img: IMG + '067253.png' },
  { name: 'Curve Line Monocomando Cromo Cocina', code: '067254', img: IMG + '067254.png' },
  { name: 'Lyon',                                code: '094000', img: IMG + '094000.png' },
  { name: 'Oslo',                                code: '094002', img: IMG + '094002.png' },
  { name: 'Riga',                                code: '094005', img: IMG + '094005.png' },
  { name: 'Porto',                               code: '094008', img: IMG + '094008.png' },
  { name: 'Zara',                                code: '094012', img: IMG + '094012.png' },
  { name: 'Praga',                               code: '094014', img: IMG + '094014.png' },
  { name: 'Milan',                               code: '094016', img: IMG + '094016.png' },
  { name: 'Niza',                                code: '094018', img: IMG + '094018.png' },
  { name: 'Curve Line Lavatorio',                code: '067255', img: IMG + '067255.png' },
  { name: 'Square Line Lavatorio Bajo',          code: '067256', img: IMG + '067256.jpg' },
  { name: 'Square Line Lavatorio Alto',          code: '067257', img: IMG + '067257.png' },
  { name: 'Curve Line Ducha Exterior',           code: '067258', img: IMG + '067258.png' },
  { name: 'Square Line Ducha Exterior',          code: '067259', img: USER_IMG           },
  { name: 'Curve Line Bidet',                    code: '067260', img: IMG + '067260.png' },
  { name: 'Square Line Bidet',                   code: '067261', img: IMG + '067261.png' },
];

const cards = products.map(p => {
  const src = b64(p.img);
  return '<div class="card">' +
    '<div class="img-wrap"><img src="' + src + '" alt="' + p.name + '" /></div>' +
    '<div class="name">' + p.name + '</div>' +
    '<div class="code">' + p.code + '</div>' +
    '</div>';
}).join('');

const css = [
  '@page { size: A4; margin: 10mm 10mm; }',
  '* { margin:0; padding:0; box-sizing:border-box; }',
  'body { font-family: Arial, Helvetica, sans-serif; }',
  '.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm 7mm; }',
  '.card { border: 1px solid #ccc; padding: 5mm 4mm 4mm; display: flex; flex-direction: column; align-items: center; break-inside: avoid; height: 85mm; }',
  '.img-wrap { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; overflow: hidden; }',
  '.img-wrap img { max-width: 100%; max-height: 64mm; object-fit: contain; }',
  '.name { font-size: 8.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; text-align: center; margin-top: 3mm; color: #111; line-height: 1.3; }',
  '.code { font-size: 7.5pt; color: #666; margin-top: 1.5mm; text-align: center; }'
].join(' ');

const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><style>' + css + '</style></head><body><div class="grid">' + cards + '</div></body></html>';

const OUT = 'C:/Users/Usuario/Documents/Hausag/catalogo_griferias.pdf';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 120000 });
  // give a moment for layout to settle
  await new Promise(r => setTimeout(r, 2000));
  await page.pdf({ path: OUT, format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF generado: ' + OUT);
})();
