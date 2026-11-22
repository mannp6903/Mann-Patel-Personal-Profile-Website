/**
 * The phone in Home's services section (launch motion M5, 22 Nov 2026; components/home/ServiceSummary.astro).
 * Decoration only (aria-hidden): built when the section is near, so it never counts against Home's element budget
 * (gate P3). Its text uses only characters the subset fonts cover. Imported on demand, with its styles, so phones and
 * tablets never download either (gate P2).
 *
 * 22 Nov 2026 (upgrade report R8.3): the website screen no longer has an empty grey "photo" box; the page's own sections
 * (labels only, no invented facts) sit under the Book button instead. "Your business" is the
 * reader's own business, so the phone stays a picture of the service; a real client screen goes in only once it can be
 * shown without implying features that client's site doesn't have (instant booking, missed-call text-back, 5 stars).
 */
import css from '../styles/service-phone.css?inline';

/** The phone's styles, added to the page with its markup (as a string, so the page's own styles never include them). */
const SERVICE_PHONE_CSS = css;

const SERVICE_PHONE = `<div class="ssp" data-scene="0" data-sub="0" aria-hidden="true"><div class="ssp__screen"><span class="ssp__island"></span><div class="ssp__scene ssp__scene--0"><p class="ssp__search"><svg class="ssp__mag" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="6"></circle><path d="M13 13l5 5"></path></svg><span><span data-typed></span><span class="ssp__caret"></span></span></p><div class="ssp__below"><ul class="ssp__sugg"><li>hair salon near me</li><li>hair salon open now</li><li>hair salon scarborough</li></ul><div class="ssp__results"><div class="ssp__map"><svg class="ssp__streets" viewBox="0 0 70 40" preserveAspectRatio="xMidYMid slice"><path class="ssp__hwy" d="M-3 9 L73 3.5"></path><path class="ssp__road" d="M10 -3 L15 43 M37.5 -3 L40 43 M59 -3 L62 43 M-3 24 L73 21.5 M-3 35 L73 36.5"></path><rect class="ssp__park" x="43" y="25.5" width="13" height="7.5" rx="1"></rect></svg><span class="ssp__pin" style="left:20%;top:42%"></span><span class="ssp__pin" style="left:82%;top:34%"></span><span class="ssp__pin" style="left:36%;top:84%"></span><svg class="ssp__you" viewBox="0 0 24 32" style="left:57%;top:62%"><path d="M12 31C12 31 2 18.5 2 11a10 10 0 0 1 20 0c0 7.5-10 20-10 20Z"></path><circle cx="12" cy="11" r="4"></circle></svg></div><div class="ssp__card"><p class="ssp__strong">Your business</p><svg class="ssp__stars" viewBox="0 0 100 18"><path transform="translate(0 0)" d="M9 1l2.4 5 5.4.6-4 3.8 1.1 5.4L9 13.1l-4.9 2.7 1.1-5.4-4-3.8 5.4-.6z"></path><path transform="translate(20 0)" d="M9 1l2.4 5 5.4.6-4 3.8 1.1 5.4L9 13.1l-4.9 2.7 1.1-5.4-4-3.8 5.4-.6z"></path><path transform="translate(40 0)" d="M9 1l2.4 5 5.4.6-4 3.8 1.1 5.4L9 13.1l-4.9 2.7 1.1-5.4-4-3.8 5.4-.6z"></path><path transform="translate(60 0)" d="M9 1l2.4 5 5.4.6-4 3.8 1.1 5.4L9 13.1l-4.9 2.7 1.1-5.4-4-3.8 5.4-.6z"></path><path transform="translate(80 0)" d="M9 1l2.4 5 5.4.6-4 3.8 1.1 5.4L9 13.1l-4.9 2.7 1.1-5.4-4-3.8 5.4-.6z"></path></svg><p class="ssp__muted">Hair salon, open now</p><p class="ssp__chips"><span class="ssp__chip ssp__chip--on">Website</span><span class="ssp__chip">Call</span><span class="ssp__chip">Directions</span></p></div></div></div></div><div class="ssp__scene ssp__scene--1"><p class="ssp__chat-head"><span class="ssp__avatar"></span><span class="ssp__strong">Your business</span></p><p class="ssp__notice">Missed call, 6:42 pm</p><p class="ssp__bubble ssp__bubble--out">Sorry we missed your call! Book online here, or reply with a time that suits you.<span class="ssp__small">Automatic reply</span></p><p class="ssp__bubble ssp__bubble--in">Thursday afternoon works for me.</p></div><div class="ssp__scene ssp__scene--2"><p class="ssp__site-nav"><span class="ssp__strong">Your business</span><span class="ssp__menu"></span></p><p class="ssp__site-h">Cuts, colour and care in Scarborough.</p><p class="ssp__muted">Prices on the page. Book online any time.</p><p class="ssp__book">Book a visit<span class="ssp__tap"></span></p><ul class="ssp__rows"><li>Services and prices</li><li>Hours and directions</li><li>Reviews</li></ul><div class="ssp__done"><svg class="ssp__check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11"></circle><path d="M7 12.5l3.5 3.5 6.5-7.5"></path></svg><p class="ssp__strong">You’re booked.</p><p class="ssp__muted">Thursday, 3:30 pm</p><p class="ssp__text"><span class="ssp__strong">Text to you</span>New booking from your website: Thursday, 3:30 pm.</p></div></div></div></div>`;

/**
 * Builds the phone beside the tiles and lets scroll drive it: the tile at the reading line (62% down the screen, so the
 * last tile finishes its scene while the phone is still pinned) picks the scene; past 45% of that tile, its second beat.
 */
export function startServicePhone(section: HTMLElement, bento: HTMLElement, wide: MediaQueryList) {
  const tiles = [...section.querySelectorAll<HTMLElement>('[data-scene-tile]')];
  const query = 'hair salon near me';
  const style = document.createElement('style');
  style.textContent = SERVICE_PHONE_CSS;
  document.head.append(style);
  bento.insertAdjacentHTML('afterend', SERVICE_PHONE);
  const phone = section.querySelector<HTMLElement>('.ssp');
  if (!phone || !tiles.length) return;
  const typed = phone.querySelector<HTMLElement>('[data-typed]');
  tiles[0].classList.add('is-on');
  let near = true;
  let ticking = false;
  const update = () => {
    ticking = false;
    if (!wide.matches) return;
    const mid = innerHeight * 0.62;
    let i = 0;
    tiles.forEach((t, k) => {
      if (t.getBoundingClientRect().top <= mid) i = k;
    });
    const r = tiles[i].getBoundingClientRect();
    const local = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    if (phone.dataset.scene !== String(i)) {
      phone.dataset.scene = String(i);
      tiles.forEach((t, k) => t.classList.toggle('is-on', k === i));
    }
    const sub = local > 0.45 ? '1' : '0';
    if (phone.dataset.sub !== sub) phone.dataset.sub = sub;
    const chars = i > 0 ? query.length : Math.round(Math.min(1, local / 0.4) * query.length);
    if (typed && typed.textContent!.length !== chars) typed.textContent = query.slice(0, chars);
  };
  const onScroll = () => {
    if (!near || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  new IntersectionObserver(
    (entries) => {
      near = entries.some((e) => e.isIntersecting);
      onScroll();
    },
    { rootMargin: '50% 0px' },
  ).observe(section);
  addEventListener('scroll', onScroll, { passive: true });
  wide.addEventListener('change', onScroll);
  update();
}
