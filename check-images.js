const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'school-of-agriculture/index.html',
  'b-sc-hons-agriculture/index.html',
  'b-sc-hons-agritech/index.html',
  'b-sc-hons-horticulture/index.html',
  'apply-now/index.html'
];

const rootDir = process.cwd();
const missing = [];

pages.forEach(pg => {
  const filePath = path.join(rootDir, pg);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  const regex = /<img[^>]+src=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const src = match[1].trim();
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.startsWith('data:')) continue;

    let relPath = src.startsWith('/') ? src.substring(1) : src;
    relPath = relPath.split('?')[0].split('#')[0];
    const diskPath = path.join(rootDir, relPath);

    if (!fs.existsSync(diskPath)) {
      missing.push({ page: pg, src, relPath });
    }
  }
});

console.log(`BROKEN <img> COUNT: ${missing.length}`);
console.log(JSON.stringify(missing, null, 2));
