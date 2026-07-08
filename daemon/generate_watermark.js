const fs = require('fs');
const sharp = require('sharp');

const svg = `<svg width="400" height="100">
  <text x="10" y="60" font-family="Arial, sans-serif" font-weight="bold" font-size="48" fill="white" opacity="0.5">Naren's Studio</text>
</svg>`;

fs.writeFileSync('watermark.svg', svg);

sharp('watermark.svg')
  .png()
  .toFile('watermark.png')
  .then(() => console.log('Watermark created'))
  .catch(console.error);
