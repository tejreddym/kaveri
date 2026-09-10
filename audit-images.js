const fs = require('fs');
const path = require('path');
const http = require('http');

const pages = [
  'school-of-agriculture/index.html',
  'b-sc-hons-agriculture/index.html',
  'b-sc-hons-agritech/index.html',
  'b-sc-hons-horticulture/index.html',
  'agriculture-ug-programs/index.html',
  'agriculture-pg-programs/index.html',
  'm-sc-agriculture-agronomy/index.html',
  'm-sc-agriculture-soil-science/index.html',
  'm-sc-agriculture-genetics-plant-breeding/index.html',
  'master-of-business-administration-mba-in-agribusiness-management/index.html'
];

const baseDir = __dirname;
let imageRefs = [];

pages.forEach(pagePath => {
  const fullPath = path.join(baseDir, pagePath);
  if (!fs.existsSync(fullPath)) return;

  const content = fs.readFileSync(fullPath, 'utf8');

  // Match src="..."
  const srcRegex = /src=["']([^"']+)["']/gi;
  let match;
  while ((match = srcRegex.exec(content)) !== null) {
    const src = match[1];
    if (src && !src.startsWith('data:') && !src.startsWith('http:') && !src.startsWith('https:')) {
      imageRefs.push({ page: pagePath, type: 'src', url: src });
    }
  }

  // Match srcset="..."
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(content)) !== null) {
    const srcset = match[1];
    const items = srcset.split(',');
    items.forEach(item => {
      const parts = item.trim().split(/\s+/);
      const url = parts[0];
      if (url && !url.startsWith('data:')) {
        imageRefs.push({ page: pagePath, type: 'srcset', url: url });
      }
    });
  }
});

console.log(`Found ${imageRefs.length} total image references across ${pages.length} agriculture pages.\n`);

async function testUrl(ref) {
  let reqUrl = ref.url;
  // If protocol-relative starting with //, convert to http://localhost:8080/
  if (reqUrl.startsWith('//')) {
    reqUrl = 'http://127.0.0.1:8080/' + reqUrl.substring(2);
  } else if (reqUrl.startsWith('/')) {
    reqUrl = 'http://127.0.0.1:8080' + reqUrl;
  } else {
    reqUrl = 'http://127.0.0.1:8080/' + reqUrl;
  }

  return new Promise(resolve => {
    http.get(reqUrl, res => {
      resolve({
        page: ref.page,
        type: ref.type,
        url: ref.url,
        requestUrl: reqUrl,
        status: res.statusCode
      });
    }).on('error', err => {
      resolve({
        page: ref.page,
        type: ref.type,
        url: ref.url,
        requestUrl: reqUrl,
        status: 'ERR_' + err.code
      });
    });
  });
}

async function runAudit() {
  const results = await Promise.all(imageRefs.map(testUrl));
  const broken = results.filter(r => r.status !== 200);

  console.log('====================================================');
  console.log(` AUDIT COMPLETE: ${results.length} CHECKED, ${broken.length} BROKEN`);
  console.log('====================================================\n');

  if (broken.length > 0) {
    console.log('LIST OF BROKEN IMAGES:\n');
    broken.forEach((b, idx) => {
      console.log(`${idx + 1}. Page: ${b.page}`);
      console.log(`   Type: ${b.type}`);
      console.log(`   URL in HTML: ${b.url}`);
      console.log(`   Attempted URL: ${b.requestUrl}`);
      console.log(`   Status: ${b.status}\n`);
    });
  } else {
    console.log('All image references loaded successfully with HTTP 200 OK!');
  }
}

runAudit();
