/**
 * GA4 click events for the direct contact and booking links (Website Playbook, 16 Nov 2026). Pure, so it can be unit
 * tested; src/scripts/reach.ts reads the clicked link and the page and sends the event through track(), which only
 * sends anything after the visitor has allowed analytics.
 *
 * - phone_click, whatsapp_click, email_click: links marked data-contact="phone" | "whatsapp" | "email"
 * - booking_click: links marked data-booking (the "Book a free 15-minute call" button, once src/data/site.ts has a
 *   bookingUrl)
 *
 * Each has a `location`: header, footer, hero or contact (anywhere on /contact/), in that order. Elsewhere it is
 * quick_menu (the ⌘K menu), the id of the section the link sits in, or "page".
 */
export const CONTACT_CLICK_EVENTS = {
  phone: 'phone_click',
  whatsapp: 'whatsapp_click',
  email: 'email_click',
} as const;

export type ClickEventName = (typeof CONTACT_CLICK_EVENTS)[keyof typeof CONTACT_CLICK_EVENTS] | 'booking_click';

/** The event for a clicked link, from its data-contact value and whether it has data-booking. null = none. */
export function clickEventName(link: { contact?: string | null; booking?: boolean }): ClickEventName | null {
  if (link.booking) return 'booking_click';
  const contact = link.contact as keyof typeof CONTACT_CLICK_EVENTS | undefined | null;
  return contact && Object.hasOwn(CONTACT_CLICK_EVENTS, contact) ? CONTACT_CLICK_EVENTS[contact] : null;
}

export interface ClickPlace {
  /** Inside the site header ([data-header]). */
  header: boolean;
  /** Inside the site footer. */
  footer: boolean;
  /** Inside the home page hero (#hero). */
  hero: boolean;
  /** Inside the quick menu dialog ([data-qm]). */
  quickMenu: boolean;
  /** The page's path, e.g. "/contact/". */
  path: string;
  /** The id of the nearest section around the link, if any. */
  section?: string | null;
}

/** Where on the site a link was clicked: header, footer, hero or contact first, then the fallbacks above. */
export function clickLocation(p: ClickPlace): string {
  if (p.header) return 'header';
  if (p.footer) return 'footer';
  if (p.hero) return 'hero';
  if (p.path === '/contact/' || p.path.startsWith('/contact/')) return 'contact';
  if (p.quickMenu) return 'quick_menu';
  return p.section || 'page';
}
