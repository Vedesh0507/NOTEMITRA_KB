/**
 * PWA Icon Generator Script for NoteMitra
 * 
 * This script generates PNG icons for the PWA from the SVG source.
 * Run this script once to create the icon files.
 * 
 * Prerequisites:
 * npm install sharp
 * 
 * Usage:
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp for PNG generation
async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const svgPath = path.join(publicDir, 'icon.svg');
  
  console.log('Generating PWA icons...');
  
  try {
    const sharp = require('sharp');
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✓ Created icon-192.png');
    
    // Generate 512x512 icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✓ Created icon-512.png');
    
    // Generate favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✓ Created favicon.ico');
    
    console.log('\n✅ All icons generated successfully!');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n⚠️  Sharp module not found.');
      console.log('To generate PNG icons, install sharp:');
      console.log('  npm install sharp');
      console.log('\nAlternatively, you can manually convert the SVG to PNG using:');
      console.log('  - https://svgtopng.com/');
      console.log('  - Any image editor (GIMP, Photoshop, etc.)');
      console.log('\nRequired sizes:');
      console.log('  - icon-192.png (192x192 pixels)');
      console.log('  - icon-512.png (512x512 pixels)');
      console.log('\nPlace the generated files in: client/public/');
    } else {
      console.error('Error generating icons:', error);
    }
  }
}

generateIcons();
