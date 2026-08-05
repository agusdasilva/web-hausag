const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimizeImages() {
  const assetsDir = path.join(__dirname, '../coming-soon/assets');
  const frontendAssetsDir = path.join(__dirname, '../hausag-frontend/public/assets/images');
  
  const files = [
    { name: 'dark_texture.jpg', isBg: true },
    { name: 'hausag_header.png', isBg: false }
  ];

  for (const file of files) {
    const inputPath = path.join(assetsDir, file.name);
    const parsed = path.parse(file.name);
    const outputPath = path.join(assetsDir, `${parsed.name}.webp`);
    const frontendOutputPath = path.join(frontendAssetsDir, `${parsed.name}.webp`);

    console.log(`Processing ${file.name}...`);
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      let sharpInstance = image;
      
      // If it's the logo, restrict width to 800px max
      if (!file.isBg && metadata.width > 800) {
        sharpInstance = sharpInstance.resize(800);
      }
      // If it's the background, restrict width to 1920px max
      else if (file.isBg && metadata.width > 1920) {
        sharpInstance = sharpInstance.resize(1920);
      }

      await sharpInstance
        .webp({ quality: 75 })
        .toFile(outputPath);
      
      // Also save a copy for the frontend to fix the NG0913 error
      await sharpInstance
        .webp({ quality: 75 })
        .toFile(frontendOutputPath);

      console.log(`Successfully optimized and saved as WEBP.`);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
    }
  }
}

optimizeImages();
