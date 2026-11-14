/**
 * Fills in the Call / WhatsApp / Text links ([data-reach]) from their encoded number, and records
 * clicks (contact links, calls to action, project opens) when analytics is allowed.
 * Without JavaScript the links point to the contact page.
 */
import { channelHref, decodePhone, type Channel } from '../lib/phone';
import { track } from './analytics';

document.querySelectorAll<HTMLAnchorElement>('a[data-reach][data-k]').forEach((a) => {
  try {
    a.href = channelHref(a.dataset.reach as Channel, decodePhone(a.dataset.k!));
  } catch {
    /* leave the contact-page fallback */
  }
});

// The "Show number" button is gone: since 14 Nov 2026 the full number is on the page (SEO audit).

// Clicks, kept apart from leads (a click is not an enquiry): contact links, calls to action and
// project opens. Only the kind of click and where it was; never anything typed into a form.
const where = (el: Element) =>
  el.closest('header')?.matches('[data-header]') ? 'header' : el.closest('footer') ? 'footer' : (el.closest('section[id]')?.id ?? 'page');
document.addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
  if (!a) return;
  if (a.dataset.contact) {
    track('contact_click', { method: a.dataset.contact });
    return;
  }
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === '/contact/') {
    track('cta_click', { cta: url.searchParams.get('package') === 'check-up' ? 'free_check' : 'start_project', location: where(a) });
    return;
  }
  const project = url.pathname.match(/^\/work\/([a-z0-9-]+)\/$/);
  if (project) track('select_content', { content_type: 'project', content_id: project[1], location: where(a) });
});

export {};
