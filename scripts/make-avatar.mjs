// The phone greeting row's avatar (design upgrade Phase 5, task 5.3): a head-and-shoulders square cut from the hero
// portrait, so at 40px the face fills the circle instead of the whole scene. Run: node scripts/make-avatar.mjs
import sharp from 'sharp';

const SRC = 'src/assets/mann-patel-hero.jpg'; // 1254 × 1254
const OUT = 'src/assets/mann-patel-avatar.jpg';
// Head and shoulders: from just above the hair to the collar, centred on the face.
const box = { left: 250, top: 110, width: 760, height: 760 };

await sharp(SRC).extract(box).resize(360, 360).jpeg({ quality: 86, mozjpeg: true }).toFile(OUT);
console.log(`${OUT}: 360 × 360 from ${SRC} at ${box.left},${box.top} (${box.width}px square)`);
