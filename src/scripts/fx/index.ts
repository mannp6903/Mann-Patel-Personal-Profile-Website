/**
 * The "Live Signal" effects layer (round 6). Every effect is progressive enhancement: the page is
 * complete without it, it never delays the first paint, and reduced motion turns it off.
 *
 *   field.ts   WebGL signal field (dot map, aurora, pointer swell, radar pings)
 *   cursor.ts  cursor follower with context labels
 *   pointer.ts magnetic buttons, spotlight panels, 3D tilt
 *   text.ts    decoding labels, scroll-lit statements
 *   marquee.ts scroll-driven marquee
 */
import { initFields } from './field';
import { initCursor } from './cursor';
import { initPointer } from './pointer';
import { initDecode, initScrub } from './text';
import { initMarquee } from './marquee';

initScrub();
initMarquee();
initDecode();
initPointer();
initCursor();
// The GPU work waits until the page has loaded.
if (document.readyState === 'complete') initFields();
else addEventListener('load', () => initFields(), { once: true });
