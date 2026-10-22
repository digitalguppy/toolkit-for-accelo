// Rasterise the shared vector mark for Chromium toolbar and management surfaces.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const directory = path.join(__dirname, '../extension/icons');
async function buildIcons() {
  const source = fs.readFileSync(path.join(directory, 'toolkit.svg'));
  for (const size of [16, 32, 48, 128]) {
    await sharp(source, {density: 384}).resize(size, size).png().toFile(path.join(directory, `icon-${size}.png`));
  }
}
buildIcons().catch(error => {console.error(error); process.exitCode = 1;});
