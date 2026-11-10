// Regenerate the still frame after editing src/scripts/signal-sculpture.ts.
import sharp from 'sharp';
import { signalColor, signalFrame, signalRestPose, signalViewBox } from '../src/scripts/signal-sculpture.ts';

const { width, height } = signalViewBox;
const paths = signalFrame(...signalRestPose).map(({ points, light, gleam }) => {
  const color = signalColor(light, gleam);
  const vertices = points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return `<polygon points="${vertices}" fill="${color}" stroke="${color}" stroke-width=".7"/>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * 1.5}" height="${height * 1.5}" viewBox="0 0 ${width} ${height}">${paths.join('')}</svg>`;
await sharp(Buffer.from(svg))
  .webp({ quality: 84, alphaQuality: 90 })
  .toFile(new URL('../src/assets/signal-study.webp', import.meta.url).pathname);
