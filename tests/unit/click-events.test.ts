import { describe, expect, it } from 'vitest';
import { clickEventName, clickLocation, type ClickPlace } from '../../src/lib/click-events';

const at = (p: Partial<ClickPlace>): ClickPlace => ({ header: false, footer: false, hero: false, quickMenu: false, path: '/', ...p });

describe('GA4 click events (Website Playbook, 16 Nov 2026)', () => {
  it('names phone, WhatsApp, email and booking clicks, and nothing else', () => {
    expect(clickEventName({ contact: 'phone' })).toBe('phone_click');
    expect(clickEventName({ contact: 'whatsapp' })).toBe('whatsapp_click');
    expect(clickEventName({ contact: 'email' })).toBe('email_click');
    expect(clickEventName({ booking: true })).toBe('booking_click');
    // Text messages and social profiles keep only the older contact_click.
    for (const contact of ['text', 'linkedin', 'github', 'toString', '', undefined, null]) expect(clickEventName({ contact }), String(contact)).toBeNull();
    expect(clickEventName({})).toBeNull();
  });

  it('says where the link was: header, footer, hero, then anywhere on /contact/', () => {
    expect(clickLocation(at({ header: true, path: '/contact/' }))).toBe('header');
    expect(clickLocation(at({ footer: true, path: '/contact/' }))).toBe('footer');
    expect(clickLocation(at({ hero: true }))).toBe('hero');
    expect(clickLocation(at({ path: '/contact/', section: 'reach' }))).toBe('contact');
    expect(clickLocation(at({ path: '/contact/received/' }))).toBe('contact');
  });

  it('elsewhere: the quick menu, the section the link sits in, or "page"', () => {
    expect(clickLocation(at({ quickMenu: true, path: '/about/' }))).toBe('quick_menu');
    expect(clickLocation(at({ path: '/pricing/', section: 'free' }))).toBe('free');
    expect(clickLocation(at({ path: '/about/' }))).toBe('page');
  });
});
