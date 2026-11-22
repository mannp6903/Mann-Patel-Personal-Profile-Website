/**
 * Home's odometer prices (launch motion M7, 22 Nov 2026; components/home/PricingTeaser.astro imports this on demand).
 * Each price gets an aria-hidden overlay of digit columns that turns one lap and lands on the same figure; the overlay
 * is then removed and the plain price shows again. The prices themselves never change.
 */
import css from '../styles/odometer.css?inline';

const COLUMN = Array.from({ length: 20 }, (_, i) => i % 10).join('\n');

export function roll(list: HTMLElement) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  const overlays: HTMLElement[] = [];
  list.querySelectorAll<HTMLElement>('[data-price]').forEach((price, r) => {
    const text = price.textContent ?? '';
    if (!/\d/.test(text)) return;
    const odo = document.createElement('span');
    odo.className = 'pt-odo';
    odo.setAttribute('aria-hidden', 'true');
    odo.style.setProperty('--r', String(r));
    let k = 0;
    for (const ch of text) {
      if (!/\d/.test(ch)) {
        odo.append(ch);
        continue;
      }
      const win = document.createElement('span');
      win.className = 'pt-odo__d';
      const col = document.createElement('span');
      col.className = 'pt-odo__col';
      col.style.setProperty('--n', ch);
      col.style.setProperty('--k', String(k++));
      col.textContent = COLUMN;
      win.append(col);
      odo.append(win);
    }
    price.after(odo);
    price.classList.add('is-rolling');
    overlays.push(odo);
  });
  if (!overlays.length) return;
  // Next frame: start the lap. When the last column lands, put the plain prices back.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      overlays.forEach((o) => o.classList.add('is-spun'));
      const cols = list.querySelectorAll('.pt-odo__col');
      const last = cols[cols.length - 1];
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        overlays.forEach((o) => o.remove());
        list.querySelectorAll('[data-price].is-rolling').forEach((p) => p.classList.remove('is-rolling'));
      };
      if (last) last.addEventListener('transitionend', finish, { once: true });
      // A backstop for a hidden tab, where transitions may never end.
      setTimeout(finish, 4000);
    }),
  );
}
