const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Source reference images existing in repo
const srcGallery54 = path.join(baseDir, 'wp-content/uploads/2025/06/kaveri-Gallery-54.webp');
const srcGallery53 = path.join(baseDir, 'wp-content/uploads/2025/06/kaveri-Gallery-53.webp');
const srcAcadamics04 = path.join(baseDir, 'wp-content/uploads/2023/04/img-acadamics-04.webp');
const srcAcadamics05 = path.join(baseDir, 'wp-content/uploads/2023/04/img-acadamics-05.webp');
const srcDrone = path.join(baseDir, 'wp-content/uploads/2025/02/info-drone-img-bg.webp');
const srcGreenRev = path.join(baseDir, 'wp-content/themes/kaveriuniversity/assets/img/img-kaveri-group-green-revolution.webp');
const srcApproach = path.join(baseDir, 'wp-content/themes/kaveriuniversity/assets/img/info-approch-img.webp');
const srcIcon = path.join(baseDir, 'wp-content/uploads/2025/01/info-course-icon-05.png');
const srcGif = path.join(baseDir, 'wp-content/plugins/wps-visitor-counter/styles/image/web/2.gif');

const assetImgDir = path.join(baseDir, 'wp-content/themes/kaveriuniversity/assets/img');
const uploads202507Dir = path.join(baseDir, 'wp-content/uploads/2025/07');
const visitorGifDir = path.join(baseDir, 'wp-content/plugins/wps-visitor-counter/styles/image/web');

ensureDir(assetImgDir);
ensureDir(uploads202507Dir);
ensureDir(visitorGifDir);

// Mapping missing image filenames to best original Kaveri image source
const mappings = [
  // Agriculture Overview & Banner Images
  { target: path.join(assetImgDir, 'info-agri-img-01.webp'), source: srcGallery54 },
  { target: path.join(assetImgDir, 'info-overview-bg.webp'), source: srcApproach },
  { target: path.join(assetImgDir, 'info-agri-graph-img.webp'), source: srcAcadamics04 },
  { target: path.join(assetImgDir, 'info-agronomy-graph-img.webp'), source: srcAcadamics05 },
  { target: path.join(assetImgDir, 'info-btechcse-graph-img.webp'), source: srcAcadamics04 },
  { target: path.join(assetImgDir, 'msc-agriculture-soil.webp'), source: srcGallery54 },
  { target: path.join(assetImgDir, 'agri-genitics-plant-breeding.webp'), source: srcGallery53 },
  { target: path.join(assetImgDir, 'info-agri-footer-banner-img.webp'), source: srcGreenRev },
  { target: path.join(assetImgDir, 'info-agri-footer-banner-img-01.webp'), source: srcGreenRev },
  { target: path.join(assetImgDir, 'info-agri-footer-banner-img-02.webp'), source: srcGreenRev },
  { target: path.join(assetImgDir, 'Master of Business Administration (MBA) in Agribusiness Management.webp'), source: srcGallery54 },
  { target: path.join(uploads202507Dir, 'social-science.webp'), source: srcAcadamics04 },
  { target: path.join(uploads202507Dir, 'PG-Programme-Agronomy.webp'), source: srcGallery54 },
  { target: path.join(visitorGifDir, '8.gif'), source: srcGif },

  // Icons
  { target: path.join(assetImgDir, 'info-agri-icon-01.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-agri-icon-02.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-agri-icon-03.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-agri-icon-04.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-agri-icon-05.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-agri-icon-06.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-date-icon-01.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-date-icon-02.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-date-icon-03.png'), source: srcIcon },
  { target: path.join(assetImgDir, 'info-date-icon-04.png'), source: srcIcon }
];

let copied = 0;
mappings.forEach(m => {
  if (fs.existsSync(m.source)) {
    fs.copyFileSync(m.source, m.target);
    copied++;
    console.log(`Copied ${path.basename(m.source)} -> ${path.relative(baseDir, m.target)}`);
  } else {
    console.error(`Source missing for ${m.target}`);
  }
});

console.log(`\nSuccessfully populated ${copied} missing image files!`);
