/**
 * Generate Chrome extension icons from PNG source
 * Run: node extension/scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp for PNG resizing
async function generateWithSharp() {
  try {
    const sharp = require('sharp');
    const sizes = [16, 32, 48, 128];

    // Try PNG first, then SVG
    let sourcePath = path.join(__dirname, '..', 'assets', 'icons', 'logo-source.png');
    if (!fs.existsSync(sourcePath)) {
      sourcePath = path.join(__dirname, '..', 'assets', 'icon-source.svg');
    }

    const outputDir = path.join(__dirname, '..', 'assets', 'icons');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const sourceBuffer = fs.readFileSync(sourcePath);

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}.png`);
      await sharp(sourceBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon-${size}.png`);
    }

    console.log('\nAll icons generated successfully!');
    return true;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw error;
  }
}

// Fallback: Generate simple colored icons using pure Node.js
function generateSimpleIcons() {
  const sizes = [16, 32, 48, 128];
  const outputDir = path.join(__dirname, '..', 'assets', 'icons');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create SVG icons at each size (can be manually converted to PNG)
  for (const size of sizes) {
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#4f46e5"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="120" height="120" rx="24" fill="url(#bgGradient)"/>
  <g transform="translate(24, 20) scale(0.48)">
    <path d="M104.004 105C104.004 105 158.019 98.8837 156.004 54C153.99 9.11629 104.004 9 104.004 9H30.5043C30.5043 9 22.5044 9 14.5044 16.5C10.0518 20.6743 9.00434 29.5 9.00434 29.5V136.5C9.00434 136.5 8.64328 144 14.5043 150C22.3191 158 30.5043 157 30.5043 157H84.5043C84.5043 157 94.5104 154.159 98.5043 150C102.557 145.78 104.004 136.5 104.004 136.5V105ZM104.004 105H71.0043C71.0043 105 66.0043 105.857 61.5043 102C57.0043 98.1428 57.5043 94 57.5043 94V70.5C57.5043 70.5 58.0043 64.75 61.5043 61C65.0043 57.25 71.0043 56.5 71.0043 56.5H92.5043C92.5043 56.5 96.2345 56.5 100.004 60C102.312 62.1422 104.004 67 104.004 67V105Z" fill="white"/>
  </g>
</svg>`;
    const outputPath = path.join(outputDir, `icon-${size}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`Generated SVG: icon-${size}.svg`);
  }

  console.log('\nSVG icons generated. To convert to PNG:');
  console.log('1. Install sharp: npm install sharp');
  console.log('2. Run this script again');
  console.log('\nOr manually convert using an online tool like:');
  console.log('https://svgtopng.com/');
}

async function main() {
  console.log('Generating Prereq extension icons...\n');

  const success = await generateWithSharp();
  if (!success) {
    console.log('sharp not found, generating SVG icons instead...\n');
    generateSimpleIcons();
  }
}

main().catch(console.error);
