/**
 * The effects layer, kept deliberately small (round 7, after the 8 Nov 2026 audit asked for one
 * visual language and no effect in every section). Every effect is progressive enhancement: the
 * page is complete without it, it never delays the first paint, and reduced motion turns it off.
 *
 *   field.ts   WebGL signal field behind the home hero and the 404 page (dot map, radar pings)
 *   text.ts    decoding only where marked with data-scramble (the hero coordinates)
 *
 * 22 Nov 2026 (upgrade report R8.1): pointer.ts is gone. The magnetic pull moved the button you were aiming at, and the
 * lime spotlight that followed the cursor was a glow, not proof of work.
 */
import { initFields } from './field';
import { initDecode } from './text';

initDecode();
// The GPU work waits until the page has loaded.
if (document.readyState === 'complete') initFields();
else addEventListener('load', () => initFields(), { once: true });
