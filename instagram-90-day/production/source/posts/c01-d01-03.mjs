// Chapter 1 · Found. Answered. Booked. — Days 01–03 (pilot)
import { DEMO, DEMO_DATA, REAL, CHECK, end, tags } from '../kit.mjs';

export default [
  // ───────────────────────── DAY 01 ─────────────────────────
  {
    id: 'D01-P1', format: 'reel', title: 'Your next customer decides in three screens',
    series: 'Found. Answered. Booked.', episode: '01', chapter: '01 · Found. Answered. Booked.',
    services: ['business-profile', 'missed-calls', 'booking', 'websites'], topics: ['cta-actions', 'form-ack', 'request-vs-confirmed'],
    sector: 'Owner-operated service businesses (cleaning shown)', question: 'Who is Mann, and what does he actually fix?',
    purpose: 'Founder introduction and series opener; pinned entry point 1 of 3.',
    promise: 'In 25 seconds you will know the three screens every new customer checks, and who I am.',
    action: 'Follow for the 90-day series',
    related: [{ id: 'D01-P2', why: 'the 3-screen test you can run tonight' }, { id: 'D01-P3', why: 'what the free check covers' }],
    next: { id: 'D01-P2', text: 'The 3-screen test you can run tonight' },
    hooks: [
      { line: 'Your next customer decides in three screens.', why: 'A specific, countable promise; the viewer wants to know which three.' },
      { line: 'Most customers never call you. They check you first.', why: 'Names a hidden behaviour, but is vaguer about the payoff.' },
    ],
    chosen: 0, whyWins: 'It promises a number the film then delivers screen by screen, so every cut pays off part of the hook.',
    firstFrame: 'Black frame; “Your next customer / decides in / three screens.” rises line by line, the last line in lime. Mono eyebrow names Toronto, Scarborough and North York.',
    scenario: 'Sam, a customer in Scarborough, looks for a deep clean on a phone. Screen 1: search results and a map. Screen 2: Sam texts the business and gets an honest automatic reply. Screen 3: Sam picks Saturday at 10:00 and sees a booking request, not a fake confirmation. Then Mann introduces himself with his real photo.',
    sequence: 'Kinetic hook → search on a phone (Found) → instant reply thread (Answered) → booking request (Booked) → Mann’s portrait and one-line introduction → end card with the three words and the next post.',
    payoff: 'All three screens are shown, named and shown working, then the person who builds them appears.',
    art: { dir: 'night', extra: 'phone scenes on night, portrait on night, end card on night; lime marks one word per scene', props: 'Labelled demo search, message thread and booking screens; Mann’s real portrait (supplied by Mann, used on mannpatel.me)' },
    music: 'bed-signal',
    labels: ['Demo · fictional business (screens 1–3)'],
    claims: [
      { claim: 'Mann builds websites, Google profiles and enquiry follow-up for Toronto service businesses', source: 'mannpatel.me home and /services/, checked 11 Nov 2026' },
      { claim: 'Nest & Rest Cleaning is Mann’s own business; website live, business opens summer 2027', source: 'mannpatel.me/work/nest-and-rest-cleaning/, nestnrestcleaning.com, checked 11 Nov 2026' },
      { claim: 'A booking request is not a booking', source: 'mannpatel.me/services/enquiry-follow-up/ (scoped options note)' },
    ],
    scenes: [
      { layout: 'hook', dur: 3.4, eyebrow: 'Toronto · Scarborough · North York', lines: ['Your next customer', 'decides in', '*three screens.*'], size: 100, shot: 'Kinetic type on near-black; lines rise and settle; lime on the last line.' },
      { layout: 'phone', dur: 5.0, tr: 'push', eyebrow: 'Screen 1', lines: ['Can they', '*find you?*'], badge: DEMO, badgePos: 'bottom',
        screens: [{ type: 'search', query: 'house cleaning near me', mapH: 230, pins: [[30, 42], [58, 60], [74, 30]], mine: 1, results: [{ name: 'Example Cleaning Co.', meta: '4.8 ★ (36) · House cleaning service<br>Scarborough · Open · Closes 7 PM' }, { name: 'Another cleaner', meta: '4.1 ★ (12) · Cleaning service' }] }],
        py: 700, scale: 1.0, sub: 'Right name, hours and real photos.', subAt: 2.5, actions: [{ at: 0.6, do: 'type', target: 'query', cps: 26 }, { at: 1.9, do: 'show', target: 'results.0', anim: 'up', sfx: 'pop' }],
        shot: 'Phone rises into frame; the query types itself; the first result lands; lime tag confirms what makes it findable.' },
      { layout: 'phone', dur: 5.0, tr: 'push', eyebrow: 'Screen 2', lines: ['Does anyone', '*answer?*'], badge: DEMO, badgePos: 'bottom',
        screens: [{ type: 'sms', contact: 'Example Cleaning Co.', msgs: [{ dir: 'out', text: 'Hi, do you have Saturday free for a deep clean? 2-bed condo.' }, { dir: 'in', text: 'Thanks, Sam. Your message reached Example Cleaning Co. Priya replies with a quote by 5 PM today.', auto: 'Automatic reply' }] }],
        py: 700, scale: 1.0, sub: 'An honest automatic reply: who, and by when.', subAt: 2.2, actions: [{ at: 0.5, do: 'show', target: 'msgs.0', anim: 'pop', sfx: 'sent' }, { at: 1.6, do: 'show', target: 'msgs.1', anim: 'pop', sfx: 'notify' }],
        shot: 'Same phone framing; Sam’s message sends; an automatic reply arrives and says who replies and by when.' },
      { layout: 'phone', dur: 5.0, tr: 'push', eyebrow: 'Screen 3', lines: ['Can they', '*book?*'], badge: DEMO, badgePos: 'bottom',
        screens: [{ type: 'booking', title: 'Choose a time', sub: 'Deep clean · 2-bedroom condo', startDow: 0, days: 28, range: [8, 21], offDows: [0], sel: 14, slots: ['9:00 AM', '10:00 AM', '1:00 PM', '3:30 PM'], selSlot: '10:00 AM', state: { kind: 'request', title: 'Request sent', body: 'Priya confirms your time by text. Nothing is booked until she does.' } }],
        py: 700, scale: 1.0, sub: 'A request, not a fake booking.', subAt: 2.3, actions: [{ at: 0.5, do: 'tap', target: 'slots.1' }, { at: 1.4, do: 'show', target: 'state', anim: 'up', sfx: 'success' }],
        shot: 'Thumb taps 10:00 AM; a purple “Request sent” card rises and says plainly nothing is booked yet.' },
      { layout: 'portrait', dur: 6.0, tr: 'fade', src: 'asset:brand/mann-patel-portrait.jpg', photoSize: 640, photoY: 330, eyebrow: 'Hi, I’m Mann Patel', lines: ['I build all', '*three screens.*'], sub: 'For service businesses in Toronto, and for my own: Nest & Rest Cleaning.', size: 92, shot: 'Real portrait eases from soft focus to sharp; the lime signal line draws underneath; name and line follow.' },
      end({ lines: ['Found.', 'Answered.', '*Booked.*'], sub: 'One fix a day for 90 days. Follow along.', next: { label: 'Next post', text: 'The 3-screen test you can run tonight' }, dur: 5.2, tr: 'fade' }),
    ],
    cover: { layout: 'hook', eyebrow: 'Found. Answered. Booked. · 01', lines: ['Your customer', 'decides in', '*three screens.*'], size: 124, sfx: false },
    coverTitle: 'Your customer decides in three screens',
    coverNote: 'Cover: the hook on near-black, title centred inside the central 3:4 area (y 380–1540) so the profile grid keeps all three lines.',
    caption: `Your next customer decides in three screens. Most of them never call to ask.

Screen 1: can they find you? Right name, hours and photos on Google and Maps.
Screen 2: does anyone answer? Even an honest automatic reply that says who gets back to them, and by when.
Screen 3: can they book? A clear way to request a time, and a straight answer about whether it’s confirmed.

I’m Mann Patel. I build those three screens for service businesses in Toronto, with a focus on Scarborough and North York. I’m building my own too: Nest & Rest Cleaning, opening summer 2027.

For the next 90 days I’m posting one fix a day: what customers see, how it works, and how to choose the right fix. The screens in this video are a demo with a fictional business.

Follow along, and start with the next post: the 3-screen test you can run on your own phone tonight.

${tags('web', 'seo')}`,
    pinned: 'Start here: the 3-screen test is the next post. Which screen do you think trips your customers up: 1, 2 or 3?',
    keywords: 'Toronto web design, local SEO, Google Business Profile, small business website Scarborough',
  },

  {
    id: 'D01-P2', format: 'carousel', title: 'The 3-screen test',
    series: 'Owner’s Playbook', episode: '01', chapter: '01 · Found. Answered. Booked.',
    services: ['business-profile', 'websites', 'missed-calls', 'booking'], topics: ['gbp-setup', 'mobile-first', 'form-ack', 'request-vs-confirmed', 'cta-actions'],
    sector: 'Any owner-operated service business', question: 'How do I see my business the way a new customer does?',
    purpose: 'Saveable owner’s test that makes the three-stage journey practical; pinned entry point 2 of 3.',
    promise: 'Ten minutes on your own phone shows you which screen loses customers first.',
    action: 'Save this and run the test tonight',
    related: [{ id: 'D01-P1', why: 'the film this test comes from' }, { id: 'D03-P2', why: 'the full form test' }],
    next: { id: 'D02-P1', text: 'Why a profile can say Closed when you’re open' },
    hooks: [
      { line: 'The 3-screen test.', why: 'Short, nameable and saveable; promises a method rather than an opinion.' },
      { line: 'Ten minutes on your phone shows you what a stranger sees.', why: 'Concrete about effort, but a longer cover line that reads slower in the grid.' },
    ],
    chosen: 0, whyWins: 'A named test is easy to remember, send and come back to; the sub-line carries the ten-minute promise.',
    firstFrame: 'Paper-white cover: “The 3-screen / test.” in heavy ink type with a lime highlighter mark on “test”, sub-line underneath and a swipe cue.',
    scenario: 'The owner tests their own business as a stranger would, on a phone, on mobile data, in a private window, scoring three screens: Found, Answered, Booked. A filled-in example uses a fictional cleaning company.',
    payoff: 'A scored sheet and a rule for which fail to fix first.',
    art: { dir: 'paper', extra: 'editorial white space; one lime highlighter mark per slide', props: 'Checklist and table layouts; demo score sheet labelled' },
    labels: ['Demo · fictional business (slide 7)'],
    claims: [{ claim: 'Testing from a private window on mobile data shows the public view', source: 'General practice; no product claim' }],
    slides: [
      { layout: 'cover', eyebrow: 'Owner’s playbook · 01 · Save for tonight', lines: ['The 3-screen', '==test.=='], sub: 'Ten minutes on your own phone shows you what a new customer sees before they ever call. Save it for tonight.', size: 150 },
      { layout: 'checklist', eyebrow: 'Before you start', lines: ['Be a stranger,', '_not the owner._'], items: [{ t: 'Use your phone on mobile data', s: 'Not office Wi‑Fi, not your laptop.' }, { t: 'Open a private window', s: 'So you’re not logged in and Google doesn’t know it’s you.' }, { t: 'Set a timer: 3 minutes per screen', s: 'A customer gives you less.' }] },
      { layout: 'checklist', eyebrow: 'Screen 1 of 3', lines: ['Found.', '_Can they find you?_'], items: [{ t: 'Search “[your service] near me”', s: 'Are you on the map at all?' }, { t: 'Search your business name', s: 'Today’s hours and phone number: right or wrong?' }, { t: 'Look at the photos', s: 'Real work, or only a logo?' }, { t: 'Find a website or booking link', s: 'Does it open the right page?' }] },
      { layout: 'checklist', eyebrow: 'Screen 2 of 3', lines: ['Answered.', '_Does anyone reply?_'], items: [{ t: 'Send yourself a test enquiry', s: 'Through your own website form.' }, { t: 'Call from another phone after hours', s: 'What happens when nobody picks up?' }, { t: 'Time the first reply', s: 'Even an automatic one counts, if it’s honest.' }] },
      { layout: 'checklist', eyebrow: 'Screen 3 of 3', lines: ['Booked.', '_Can they take the next step?_'], items: [{ t: 'Try to book or request a quote', s: 'Can you do it with one thumb?' }, { t: 'Check what it promises', s: 'Is it a request, or a confirmed time? It should say which.' }, { t: 'Look for the confirmation', s: 'Did a text or email arrive?' }] },
      { layout: 'table', eyebrow: 'Score it', lines: ['Pass or fail.', '_Nothing in between._'], cols: ['Screen', 'Pass if…'], rows: [['1 · Found', 'Name, hours, phone and photos are right today'], ['2 · Answered', 'Something replies, says who, and says when'], ['3 · Booked', 'You can request a time and you know whether it’s confirmed']], foot: 'Fix the first fail first. Being found doesn’t help if nobody answers.' },
      { layout: 'table', eyebrow: 'Example score sheet', badge: DEMO, badgePos: 'bottom', lines: ['Example Cleaning Co.', '_tested on a Tuesday night_'], size: 64, cols: ['Screen', 'What happened', 'Result'], rows: [['1 · Found', 'Right hours, 12 real photos', { chip: 'Pass', cls: 'pass' }], ['2 · Answered', 'Form said “Thanks!”, inbox got nothing', { chip: 'Fail', cls: 'fail' }], ['3 · Booked', 'Not tested: screen 2 failed first', { chip: 'Skip', cls: 'wait' }]] },
      { layout: 'steps', eyebrow: 'If a screen fails', lines: ['Where to start'], steps: [{ t: 'Screen 1 fails', d: 'Fix your Google details first. It costs nothing but time.' }, { t: 'Screen 2 fails', d: 'Find out where your form and missed calls actually go.' }, { t: 'Screen 3 fails', d: 'Add one clear way to request a time, and say what happens next.' }] },
      end({ lines: ['Run it tonight.', '*Fix one thing.*'], sub: 'Save this so it’s here when you sit down with your phone.', next: { label: 'Tomorrow', text: 'Why a profile can say “Closed” when you’re open' } }),
    ],
    coverTitle: 'The 3-screen test',
    caption: `The 3-screen test: ten minutes on your own phone, as a stranger would see you.

Use mobile data and a private window, then score three screens:

1. Found: search “[your service] near me”, then your business name. Are today’s hours, phone and photos right?
2. Answered: send a test enquiry through your own form and call from another phone after hours. Does anything reply, and does it say who and when?
3. Booked: try to request a time. Does it tell you whether it’s confirmed or just a request?

Pass or fail, nothing in between. Fix the first fail first: being found doesn’t help if nobody answers.

Save this for tonight. Tomorrow: why a Google profile can say “Closed” while your lights are on.

${tags('leads', 'seo')}`,
    pinned: 'Ran it? Tell me which screen failed first: 1, 2 or 3.',
    keywords: 'small business checklist, Google Business Profile hours, website contact form test',
  },

  {
    id: 'D01-P3', format: 'still', title: 'The free website and Google check, explained',
    series: 'The Free Check', episode: '01', chapter: '01 · Found. Answered. Booked.',
    services: ['free-check'], topics: ['visibility-snapshot', 'ai-answers', 'form-ack'],
    sector: 'Owners in Toronto and the GTA', question: 'What do I get from the free check, and what isn’t included?',
    purpose: 'State the lead offer exactly as the site does, with its boundary; pinned entry point 3 of 3.',
    promise: 'Four plain steps, one written list of fixes, and a clear line between free and paid.',
    action: 'Request the free website and Google check',
    link: 'https://mannpatel.me/contact/?package=check-up#check',
    related: [{ id: 'D01-P2', why: 'do the same test yourself first' }, { id: 'D88-P1', why: 'the finale walks through a full check' }],
    next: null,
    hooks: [
      { line: 'The free website and Google check.', why: 'Uses the offer’s exact name, so it matches the site and the button people will tap.' },
      { line: 'What I check before you spend a dollar.', why: 'Warmer, but blurs what is free and what is quoted.' },
    ],
    chosen: 0, whyWins: 'An offer post should be unmistakable; the exact name avoids any gap between the post and the contact page.',
    firstFrame: 'Night background; eyebrow “Free · no obligation”; headline with lime on “check.”; four numbered steps; a boundary line at the foot.',
    scenario: 'Exactly what the check involves, in the order Mann does it, using the wording on mannpatel.me/contact.',
    payoff: 'The viewer knows the four steps, what they receive, what is not included and where to request it.',
    art: { dir: 'night', props: 'Steps layout; no imagery needed' },
    labels: [],
    claims: [
      { claim: 'The four steps and “Not included: the fixes themselves, which I quote separately”', source: 'mannpatel.me home #check and /contact/ check panel, checked 11 Nov 2026' },
      { claim: 'For businesses in Toronto and the GTA', source: 'mannpatel.me home #check' },
      { claim: 'Test call happens only with permission', source: 'mannpatel.me /contact/ (“Permission for a test call and a test enquiry”) and /services/ packages' },
    ],
    slides: [
      { layout: 'steps', eyebrow: 'Free · no obligation', lines: ['The free website', 'and Google *check.*'], size: 80, top: 140, steps: [{ t: 'I look you up the way a customer would', d: 'Google, Maps, Apple Maps and AI assistants.' }, { t: 'I compare your reviews', d: 'With the top three businesses near you.' }, { t: 'I send a test enquiry', d: 'And, with your permission, call after hours.' }, { t: 'You get a short written list of fixes', d: 'Most important first.' }], foot: 'Not included: the fixes. I quote those separately. For Toronto and the GTA · mannpatel.me/contact' },
    ],
    coverTitle: 'The free website and Google check',
    caption: `What the free website and Google check actually is.

1. I look you up the way a customer would: Google, Maps, Apple Maps and AI assistants.
2. I compare your reviews with the top three businesses near you.
3. I send a test enquiry and, with your permission, call after hours to see what a customer experiences.
4. You get a short written list of fixes, most important first.

That’s the whole thing. It’s free, with no obligation. The fixes themselves aren’t included: if you want them done, I quote them separately, and you don’t need the check to get a quote.

For businesses in Toronto and the GTA. Request it at mannpatel.me/contact and choose “Free check”. Your website or your business name is all I need.

${tags('seo', 'web')}`,
    pinned: 'No website yet? That’s fine: I’ll check your Google and Maps listing by name.',
    keywords: 'free website audit Toronto, Google Business Profile check, local SEO Scarborough',
  },

  // ───────────────────────── DAY 02 ─────────────────────────
  {
    id: 'D02-P1', format: 'reel', title: 'Closed on Google, open in real life',
    series: 'Customer’s-Eye', episode: 'Ep 01', chapter: '01 · Found. Answered. Booked.',
    services: ['business-profile'], topics: ['holiday-hours', 'gbp-setup', 'suggested-edits'],
    sector: 'Salons and shop-front services', question: 'Why would a customer drive past a business that is open?',
    purpose: 'Cold open: make a misleading detail visible from the customer’s side.',
    promise: 'See the exact moment wrong hours lose a customer, and the two-minute check that prevents it.',
    action: 'Send this to someone who runs a shop',
    related: [{ id: 'D02-P2', why: 'the full hours audit' }, { id: 'D16-P1', why: 'holiday hours in depth' }],
    next: { id: 'D02-P2', text: 'Your hours live in five places: the audit' },
    hooks: [
      { line: 'The lights are on. Google says Closed.', why: 'A visible contradiction in the first two seconds; the viewer wants to know who is right.' },
      { line: 'Would you drive there?', why: 'Puts the viewer in the customer’s seat, but needs the setup to land.' },
    ],
    chosen: 0, whyWins: 'The contradiction is the hook; “Would you drive there?” becomes the mid-film beat once the stakes are visible.',
    firstFrame: 'Illustrated shop front at dusk, warm window light and a neon OPEN sign; “The lights / are on.” in large type.',
    scenario: 'Thursday, 6:40 PM. Example Salon started opening until 8 PM on Thursdays and updated its website, but not its Google profile, which still says it closes at 6. Sam checks on the way home, sees “Closed”, and books somewhere else.',
    sequence: 'Lit shop front → phone profile reads “Closed” with the old hours circled → “Would you drive there?” → timeline of what went wrong → the two-minute fix → end card.',
    payoff: 'The customer’s decision is traced to one un-updated field, and the owner gets four steps to check it today.',
    art: { dir: 'dusk', extra: 'illustrated street at dusk; phone and timeline scenes on night', props: 'Original SVG shop front (labelled Illustration); labelled demo profile' },
    music: 'bed-night',
    labels: ['Illustration (shop front)', 'Demo · fictional business (profile)'],
    claims: [
      { claim: 'Owners can review edits suggested by the public to their Business Profile', source: 'Google Business Profile Help: “Edit your Business Profile” / suggested edits (general product behaviour)' },
      { claim: 'Special (holiday) hours are set separately from regular hours', source: 'Google Business Profile Help: “Set holiday or special hours”' },
    ],
    scenes: [
      { layout: 'storefront', dur: 3.6, sign: 'EXAMPLE SALON', lines: ['The lights', 'are on.'], textPos: 'top', textAt: 0.4, size: 120, shot: 'Slow push-in on an illustrated shop front at dusk; neon OPEN glows; street ambience.' },
      { layout: 'phone', dur: 4.8, tr: 'fade', dir: 'night', eyebrow: 'Thursday · 6:40 PM', lines: ['Google says', '*Closed.*'], badge: DEMO, badgePos: 'bottom', time: '6:40',
        screens: [{ type: 'profile', name: 'Example Salon', rating: 4.6, reviews: 84, category: 'Hair salon', area: 'Scarborough', hours: { state: 'closed', text: 'Opens 10 AM Fri' }, acts: ['Call', 'Directions', 'Website', 'Book'], lines: [{ k: '⏱', v: 'Thursday 10 AM – 6 PM' }, { k: '⌖', v: 'Scarborough, ON' }] }],
        py: 620, scale: 1.08, actions: [{ at: 0.9, do: 'shake', target: 'hours' }],
        callouts: [{ x: 300, y: 1365, text: 'Old hours: closes 6 PM', bad: true, at: 1.6, ring: false }],
        shot: 'Phone slides up showing a demo profile; the red “Closed” line shakes; an error tag points at the out-of-date Thursday hours.' },
      { layout: 'hook', dur: 2.6, dir: 'night', lines: ['Would you', '*drive there?*'], size: 140, sfxName: 'impact', shot: 'Held beat on black; two lines land on the downbeat.' },
      { layout: 'timeline', dir: 'night', eyebrow: 'What actually happened', lines: ['One field', '_nobody updated_'], badge: DEMO_DATA, badgePos: 'bottom', events: [{ time: 'Mon', text: 'Aisha starts opening until 8 PM on Thursdays' }, { time: 'Mon', text: 'Website updated' }, { time: 'Never', text: 'Google profile still says 6 PM', bad: true }, { time: 'Thu', text: '6:40 PM: Sam sees “Closed” and books elsewhere', bad: true }], per: 0.85, dur: 7.0, shot: 'Vertical timeline builds event by event; the two failures mark red.' },
      { layout: 'checklist', dur: 7.0, dir: 'night', eyebrow: 'The 2-minute check', lines: ['Check yours', '*today*'], items: [{ t: 'Search your business name on your phone' }, { t: 'Read today’s hours, and holiday hours' }, { t: 'Fix them in your Business Profile, not only your website' }, { t: 'Review any edits the public suggested' }], per: 0.95, shot: 'Checklist ticks in rhythm with the beat.' },
      end({ lines: ['Your hours', 'are a *promise.*'], sub: 'Send this to someone who runs a shop.', next: { label: 'Next post', text: 'Your hours live in five places: the audit' }, dur: 5.2, tr: 'fade' }),
    ],
    cover: { layout: 'storefront', sign: 'EXAMPLE SALON', lines: ['Closed on Google.', '*Open in real life.*'], textPos: 'top', size: 96 },
    coverTitle: 'Closed on Google. Open in real life.',
    caption: `The lights are on. Google says Closed.

Thursday, 6:40 PM. A salon started opening until 8 on Thursdays and updated its website, but not its Google profile. A customer checks on the way home, sees “Closed”, and books somewhere else. Nobody at the salon ever finds out.

The two-minute check:
1. Search your business name on your phone.
2. Read today’s hours and your holiday hours.
3. Change them in your Business Profile, not only on your website.
4. Review any edits the public has suggested.

(The salon and profile in this video are a demo with a fictional business.)

Know someone who runs a shop or salon? Send this to them. Next post: the five places your hours live, and how to audit them in five minutes.

${tags('seo')}`,
    pinned: 'Holiday season is close: Christmas, Boxing Day and New Year’s Day each need their own hours on your profile.',
    keywords: 'Google Business Profile hours, holiday hours, Scarborough salon',
  },

  {
    id: 'D02-P2', format: 'carousel', title: 'Your hours live in five places',
    series: 'Owner’s Playbook', episode: '02', chapter: '01 · Found. Answered. Booked.',
    services: ['business-profile', 'listings', 'websites'], topics: ['holiday-hours', 'apple-business-connect', 'bing-places', 'yelp-facebook'],
    sector: 'Any business with posted hours', question: 'Where do customers read my hours, and how do I keep them consistent?',
    purpose: 'Owner’s playbook: a five-minute audit with a fill-in table.',
    promise: 'Five places, one set of hours, checked in five minutes.',
    action: 'Save this before the holidays',
    related: [{ id: 'D02-P1', why: 'the film about what wrong hours cost' }, { id: 'D24-P2', why: 'Apple Maps and Bing in depth' }],
    next: { id: 'D03-P1', text: 'The enquiry that disappeared' },
    hooks: [
      { line: 'Your hours live in five places.', why: 'A surprising count that makes the viewer want the list.' },
      { line: 'If one listing is wrong, customers believe that one.', why: 'True and sharp, but abstract without the list.' },
    ],
    chosen: 0, whyWins: 'A number on the cover earns the swipe; the second line becomes the reason on slide 1.',
    firstFrame: 'Daylight cover; “Your hours live / in five places.” with lime marker under “five places”; a small row of five numbered dots.',
    scenario: 'An owner walks through the five places hours appear (Google profile, holiday hours, Apple Maps and Bing, their own website, Facebook/Instagram and voicemail) and fills in a table.',
    payoff: 'A completed audit table and the holiday dates to set now.',
    art: { dir: 'daylight', props: 'Phone with demo profile hours; checklist; fill-in table' },
    labels: ['Demo · fictional business (slide 2)'],
    claims: [
      { claim: 'Apple Business Connect controls business details shown in Apple Maps; Bing Places for Bing and Microsoft surfaces', source: 'mannpatel.me/services/#found (listings service); Apple Business Connect and Bing Places product pages' },
      { claim: 'Without special hours, a profile shows regular hours on a holiday', source: 'Google Business Profile Help: special hours' },
    ],
    slides: [
      { layout: 'cover', eyebrow: 'Owner’s playbook · 02', lines: ['Your hours live', 'in ==five places.=='], sub: 'If one is wrong, that’s the one a customer believes. The five-minute audit:', size: 112 },
      { layout: 'phone', eyebrow: 'Place 1', lines: ['Your Google', 'Business Profile'], size: 70, sub: 'Check every day of the week, not only today.', screens: [{ type: 'profile', name: 'Example Salon', rating: 4.6, reviews: 84, category: 'Hair salon', area: 'Scarborough', hours: { state: 'open', text: 'Closes 8 PM' }, lines: [{ k: 'Mon', v: '10 AM – 7 PM' }, { k: 'Thu', v: '10 AM – 8 PM' }, { k: 'Sun', v: 'Closed' }] }], badge: DEMO, badgePos: 'bottom', py: 520, scale: 1.0 },
      { layout: 'checklist', eyebrow: 'Place 2', lines: ['Holiday hours'], items: [{ t: 'Set them separately, before each holiday', s: 'Otherwise your profile can show regular hours on a day you’re closed.' }, { t: 'Next up: Christmas, Boxing Day, New Year’s Day', s: 'Then Family Day in February.' }, { t: 'Closed? Say closed', s: 'An empty day is not the same as “Closed”.' }] },
      { layout: 'checklist', eyebrow: 'Place 3', lines: ['Apple Maps', '_and Bing_'], items: [{ t: 'iPhone users often see Apple Maps first', s: 'Claim and check it in Apple Business Connect.' }, { t: 'Bing Places feeds Bing and Windows searches', s: 'Same hours, same phone number.' }] },
      { layout: 'checklist', eyebrow: 'Place 4', lines: ['Your own', 'website'], items: [{ t: 'Footer, contact page, “Visit us” section', s: 'Hours often hide in three spots on one site.' }, { t: 'One version, everywhere', s: 'If you change one, change all three.' }] },
      { layout: 'checklist', eyebrow: 'Place 5', lines: ['Social profiles', '_and your voicemail_'], items: [{ t: 'Facebook and Instagram profile details', s: 'Customers check them on the way.' }, { t: 'Your voicemail greeting', s: '“We’re open until 6” counts too.' }] },
      { layout: 'table', eyebrow: 'The audit', lines: ['Screenshot this.', '_Tick as you go._'], cols: ['Place', 'Checked', 'Matches?'], rows: [['1 · Google profile', '☐', '☐'], ['2 · Holiday hours', '☐', '☐'], ['3 · Apple Maps, Bing', '☐', '☐'], ['4 · Website', '☐', '☐'], ['5 · Social, voicemail', '☐', '☐']], fontSize: 32 },
      end({ lines: ['One set of hours.', '*Everywhere.*'], sub: 'Save this. The holidays are close.', next: { label: 'Tomorrow', text: 'The enquiry that disappeared' } }),
    ],
    coverTitle: 'Your hours live in five places',
    caption: `Your hours live in five places, and customers believe whichever one they see first.

1. Google Business Profile: check every day of the week, not only today.
2. Holiday hours: set them separately before Christmas, Boxing Day, New Year’s Day and Family Day. Without them, your profile can show regular hours on a day you’re closed.
3. Apple Maps and Bing: iPhone users often see Apple Maps first (Apple Business Connect). Bing Places covers Bing and Windows searches.
4. Your website: footer, contact page and any “Visit us” section.
5. Facebook, Instagram and your voicemail greeting.

Slide 7 is a checklist: screenshot it and tick as you go. Five minutes.

Save this before the holidays.

${tags('seo')}`,
    pinned: 'Which of the five did you forget? Voicemail is the one most people miss.',
    keywords: 'holiday hours Google, Apple Business Connect, Bing Places, business hours consistency',
  },

  {
    id: 'D02-P3', format: 'still', title: 'Search yourself: which is wrong?',
    series: 'Ask Me', episode: '01', chapter: '01 · Found. Answered. Booked.',
    services: ['business-profile', 'listings'], topics: ['gbp-photos', 'gbp-setup'],
    sector: 'Any local business', question: 'What is wrong on my listing right now?',
    purpose: 'Conversation post: a 30-second self-check with a comment prompt.',
    promise: 'One search on your phone tells you which of four things to fix first.',
    action: 'Comment the letter that applies to you',
    related: [{ id: 'D02-P2', why: 'the full audit' }, { id: 'D17-P2', why: 'photos that help' }],
    next: null,
    hooks: [
      { line: 'Search your business on your phone. What’s wrong?', why: 'An instruction the viewer can follow immediately.' },
      { line: 'Most listings have one thing wrong.', why: 'Provocative but unverifiable, so it was dropped.' },
    ],
    chosen: 0, whyWins: 'It is an action, not a claim, and the options make answering easy.',
    firstFrame: 'Lime full-bleed card with “Search yourself. / What’s wrong?” and four lettered options in dark cards.',
    scenario: 'The viewer searches their own business name and picks the first problem they see.',
    payoff: 'The viewer leaves with the first fix named, and Mann replies to comments with where to change it.',
    art: { dir: 'signal', props: 'Prompt layout' },
    labels: [],
    claims: [],
    slides: [
      { layout: 'prompt', dir: 'signal', eyebrow: 'Ask me · 30 seconds', lines: ['Search yourself.', 'What’s wrong?'], size: 104, options: [{ t: 'The hours' }, { t: 'The phone number' }, { t: 'Photos: only a logo, or none' }, { t: 'Nothing. It’s all right.' }], foot: 'Comment the letter. I’ll reply with where to fix it.' },
    ],
    coverTitle: 'Search yourself. What’s wrong?',
    caption: `Thirty-second check: search your business name on your phone right now.

What’s wrong?
A. The hours
B. The phone number
C. Photos: only a logo, or none
D. Nothing. It’s all right.

Comment the letter. I’ll reply with where to fix it, and I read every comment myself.

${tags('seo')}`,
    pinned: 'D counts too. If it’s all right, check your holiday hours next.',
    keywords: 'Google listing check, business profile photos, wrong phone number Google',
  },

  // ───────────────────────── DAY 03 ─────────────────────────
  {
    id: 'D03-P1', format: 'reel', title: 'The enquiry that disappeared',
    series: 'Customer’s-Eye', episode: 'Ep 02', chapter: '01 · Found. Answered. Booked.',
    services: ['websites', 'missed-calls'], topics: ['quote-form', 'form-ack', 'owner-notification', 'launch-tests'],
    sector: 'Home cleaning (applies to any business with a website form)', question: 'What if my website form sends enquiries nowhere?',
    purpose: 'Cold open: show a silent failure the owner can’t see.',
    promise: 'Watch a real-looking enquiry vanish, find out where it went, and get the test that catches it.',
    action: 'Send this to whoever set up your website',
    related: [{ id: 'D03-P2', why: 'the step-by-step form test' }, { id: 'D38-P1', why: 'the full enquiry series' }],
    next: { id: 'D03-P2', text: 'The 2-minute form test' },
    hooks: [
      { line: 'The customer thinks you got it.', why: 'Names the gap between what the customer sees and what the owner gets.' },
      { line: 'Your website said “Thanks!” Your inbox said nothing.', why: 'Concrete contradiction, but long for an opening frame.' },
    ],
    chosen: 0, whyWins: 'Short enough to land as a single beat after the form is sent, when the viewer has just seen the thank-you screen.',
    firstFrame: 'A phone on near-black with a demo quote form; the name field is already typing; headline “Sam sends / a quote request.”',
    scenario: 'Sam fills in Example Cleaning Co.’s quote form and sees “Thanks! We’ll be in touch.” Priya’s inbox stays empty. The form still sends to an old address set up years ago that nobody checks.',
    sequence: 'Form typed and sent → thank-you screen → lime statement card → Priya’s empty inbox → trace the message to the old address → the test → end card.',
    payoff: 'The enquiry is followed to where it actually went, and the owner gets a four-step test.',
    art: { dir: 'night', extra: 'statement beat on signal lime; trace on blueprint', props: 'Labelled demo form, inbox and flow diagram' },
    music: 'bed-clock',
    labels: ['Demo · fictional business (all screens)'],
    claims: [{ claim: 'Forms can keep sending to an old address with no error shown to the customer', source: 'General failure mode; mannpatel.me/services/enquiry-follow-up/ (“so a silent failure doesn’t go unnoticed”)' }],
    scenes: [
      { layout: 'phone', dur: 5.4, eyebrow: 'Example Cleaning Co. · website', lines: ['Sam sends', 'a quote request.'], badge: DEMO, badgePos: 'bottom', py: 600, scale: 1.08,
        screens: [{ type: 'form', brand: 'Example Cleaning Co.', title: 'Get a quote', fields: [{ label: 'Name', value: 'Sam Rivera' }, { label: 'Email', value: 'sam.rivera@example.com' }, { label: 'What do you need?', value: 'Deep clean, 2-bed condo, this Saturday?', area: true }], submit: 'Send request' }, { type: 'thanks', title: 'Thanks!', body: 'We’ll be in touch.' }],
        actions: [{ at: 0.5, do: 'type', target: 'inputs.0', cps: 24 }, { at: 1.3, do: 'type', target: 'inputs.1', cps: 34 }, { at: 2.3, do: 'type', target: 'inputs.2', cps: 30 }, { at: 3.9, do: 'tap', target: 'submit' }, { at: 4.2, do: 'swap', to: 1, sfx: 'success' }],
        shot: 'Fields type themselves; thumb taps Send; a green tick thank-you screen appears.' },
      { layout: 'statement', dur: 2.8, lines: ['The customer', 'thinks you', 'got it.'], size: 132, shot: 'Hard cut to lime; three heavy lines slam in.' },
      { layout: 'phone', dur: 4.2, dir: 'night', eyebrow: 'Priya’s inbox · 4 hours later', lines: ['Priya gets', '*nothing.*'], badge: DEMO, badgePos: 'bottom', py: 620, scale: 1.08,
        screens: [{ type: 'inbox', title: 'Inbox', sub: 'priya@examplecleaning.ca', rows: [{ from: 'Supplier', subj: 'Your order has shipped', time: '8:02' }], empty: 'No new quote requests' }],
        actions: [{ at: 1.2, do: 'show', target: 'empty', anim: 'fade' }],
        shot: 'Owner’s inbox: one unrelated email and an empty state where the enquiry should be.' },
      { layout: 'flow', dur: 7.2, dir: 'blueprint', eyebrow: 'Follow the message', lines: ['Where it', '*actually went*'], badge: DEMO_DATA, badgePos: 'bottom',
        nodes: [{ id: 'form', label: 'Step 1', text: 'Website form', x: 80, y: 640, w: 400 }, { id: 'tool', label: 'Step 2', text: 'Form sends an email', x: 560, y: 640, w: 400 }, { id: 'old', label: 'Step 3', text: 'info@old-site.ca', x: 80, y: 1000, w: 400, cls: 'bad', caption: 'An address set up years ago. Nobody checks it.' }, { id: 'priya', label: 'Should be', text: 'Priya’s inbox', x: 560, y: 1000, w: 400 }],
        edges: [['form', 'tool', 'on', 'r', 'l', 0.8], ['tool', 'old', 'bad', 'b', 't', 1.4], ['tool', 'priya', '', 'b', 't', 1.6]],
        packet: { route: ['form', 'tool', 'old'], at: 1.4, seg: 1.0, stopAt: 2, bad: false },
        note: 'Set up by a previous designer. No error, no bounce, nobody reading it.', noteAt: 3.0,
        shot: 'Technical diagram on a grid; a lime packet travels from the form and drops into the dead address, which flashes red.' },
      { layout: 'checklist', dur: 6.0, dir: 'night', eyebrow: 'Test it this week', lines: ['Four steps,', '*two minutes*'], items: [{ t: 'Send a test enquiry from your phone' }, { t: 'Check the inbox it should reach, and spam' }, { t: 'Reply: does it reach the customer?' }, { t: 'Repeat once a month' }], per: 1.0 },
      end({ lines: ['“Thanks” on', 'screen isn’t', 'a *delivery.*'], sub: 'Send this to whoever set up your website.', next: { label: 'Next post', text: 'The 2-minute form test, step by step' }, dur: 5.2, tr: 'fade' }),
    ],
    cover: { layout: 'hook', eyebrow: 'Customer’s-Eye · Ep 02', lines: ['The enquiry', 'that', '*disappeared.*'], size: 132 },
    coverTitle: 'The enquiry that disappeared',
    caption: `The customer thinks you got it.

Sam fills in a quote form and sees “Thanks! We’ll be in touch.” Priya, the owner, never gets it. The form still sends to an old address a previous designer set up years ago. No error. No bounce. Nobody reading it.

You can’t see this failure from the inside, so test it from the outside:
1. Send a test enquiry from your phone.
2. Check the inbox it should reach, and the spam folder.
3. Reply to it: does your reply reach the customer?
4. Do it again next month.

(Demo with a fictional business. The failure is real and common.)

Send this to whoever set up your website. The next post walks through the test step by step.

${tags('web', 'leads')}`,
    pinned: 'When did you last send a test through your own form? Be honest.',
    keywords: 'website contact form not working, enquiry form test, small business website Toronto',
  },

  {
    id: 'D03-P2', format: 'carousel', title: 'The 2-minute form test',
    series: 'Owner’s Playbook', episode: '03', chapter: '01 · Found. Answered. Booked.',
    services: ['websites', 'missed-calls', 'maintenance'], topics: ['launch-tests', 'form-ack', 'owner-notification', 'monthly-checks'],
    sector: 'Any business with a website form', question: 'How do I test my contact form properly?',
    purpose: 'Owner’s playbook: a monthly test with a pass/fail log.',
    promise: 'Five steps that catch a silent form failure before a customer does.',
    action: 'Save this and set a monthly reminder',
    related: [{ id: 'D03-P1', why: 'the film about the lost enquiry' }, { id: 'D79-P2', why: 'how Website Care runs this every month' }],
    next: { id: 'D04-P1', text: 'The button that wasn’t there' },
    hooks: [
      { line: 'The 2-minute form test.', why: 'Names the method and the effort.' },
      { line: 'Your form can fail without telling anyone.', why: 'Fear-led; better as the sub-line than the title.' },
    ],
    chosen: 0, whyWins: 'A practical title earns saves; the fear line explains why on the cover.',
    firstFrame: 'Blueprint grid cover: “The 2-minute / form test.” in off-white with lime on “form test”, and a mono timestamp.',
    scenario: 'The owner tests their own form as Sam would, checks what the customer sees, finds the message, replies, and logs pass or fail.',
    payoff: 'A filled-in test log and where to look when a step fails.',
    art: { dir: 'blueprint', props: 'Phone with demo form, thank-you and lock-screen notification; test log' },
    labels: ['Demo · fictional business (slides 2–6)'],
    claims: [{ claim: 'A good confirmation says what happens next', source: 'mannpatel.me/services/enquiry-follow-up/ demo and checklist' }],
    slides: [
      { layout: 'cover', eyebrow: 'Owner’s playbook · 03', lines: ['The 2-minute', '*form test.*'], sub: 'A form can fail without telling anyone. Do this once a month.', size: 132 },
      { layout: 'phone', eyebrow: 'Step 1', lines: ['Be the customer.'], size: 76, sub: 'Your phone, mobile data, and an email address that isn’t the business inbox.', badge: DEMO, badgePos: 'bottom', py: 500, scale: 1.0,
        screens: [{ type: 'form', brand: 'Example Cleaning Co.', title: 'Get a quote', fields: [{ label: 'Name', value: 'Test · Priya' }, { label: 'Email', value: 'priya.personal@example.com' }, { label: 'What do you need?', value: 'TEST, please ignore', area: true }], submit: 'Send request' }] },
      { layout: 'phone', eyebrow: 'Step 2', lines: ['Read what', 'they see.'], size: 76, sub: 'A good screen says who replies, and by when.', badge: DEMO, badgePos: 'bottom', py: 470, scale: 1.0,
        screens: [{ type: 'thanks', title: 'Thanks, Priya.', body: 'Your request reached Example Cleaning Co. We reply with a quote by 5 PM tomorrow.' }] },
      { layout: 'phone', eyebrow: 'Step 3', lines: ['Find it.'], size: 76, sub: 'Business inbox, then spam, then any other tab. Note the time.', badge: DEMO, badgePos: 'bottom', py: 500, scale: 1.0,
        screens: [{ type: 'lock', time: '9:42', date: 'Monday, December 7', notifs: [{ app: 'Mail', ico: '✉', icoBg: '#2f7cf6', time: 'now', body: '[[New quote request]]\nTest · Priya: TEST, please ignore' }] }] },
      { layout: 'checklist', eyebrow: 'Step 4', lines: ['Hit reply.'], items: [{ t: 'Your reply should go to the customer', s: 'Not to a no-reply address, and not back to the form tool.' }, { t: 'Check it arrived', s: 'Look in the test address you used in step 1.' }] },
      { layout: 'log', eyebrow: 'Step 5 · Write it down', lines: ['Pass or fail.'], badge: DEMO_DATA, badgePos: 'bottom', entries: [{ k: '9:41', t: 'Form sent from a phone', res: 'Pass', cls: 'pass' }, { k: '9:41', t: 'Screen said who replies, and when', res: 'Pass', cls: 'pass' }, { k: '9:42', t: 'Arrived in the business inbox', res: 'Fail · spam', cls: 'fail' }, { k: '9:45', t: 'Reply reached the customer', res: 'Pass', cls: 'pass' }], foot: 'One fail means fix it before you spend money sending people to the site.' },
      { layout: 'steps', eyebrow: 'If a step fails', lines: ['Where to look'], steps: [{ t: 'The “send to” address', d: 'In the form settings. Is it an inbox someone reads?' }, { t: 'Spam rules', d: 'Mark it “not spam” and add a rule for your form’s messages.' }, { t: 'The form tool’s delivery log', d: 'Many tools keep one. It shows what was sent, and where.' }, { t: 'Whoever built the site', d: 'Send them this post.' }] },
      end({ lines: ['First Monday.', '*Every month.*'], sub: 'Save this and set the reminder now.', next: { label: 'Tomorrow', text: 'The button that wasn’t there' } }),
    ],
    coverTitle: 'The 2-minute form test',
    caption: `The 2-minute form test. Do it once a month.

1. Be the customer: your phone, mobile data, and an email address that isn’t the business inbox.
2. Read what they see: a good screen says who replies, and by when.
3. Find it: business inbox, then spam, then any other tab. Note the time.
4. Hit reply: it should reach the customer, not a no-reply address.
5. Write it down: pass or fail for each step.

If a step fails, start with the form’s “send to” address, then your spam rules, then the form tool’s delivery log if it has one.

Save this and set a reminder for the first Monday of every month.

${tags('web', 'leads')}`,
    pinned: 'Tip: use the word TEST in the message so whoever reads it knows to ignore it.',
    keywords: 'contact form test, website maintenance checklist, enquiry email spam',
  },

  {
    id: 'D03-P3', format: 'still', title: 'Design note: forms that admit when they fail',
    series: 'Design Notes', episode: '01', chapter: '01 · Found. Answered. Booked.',
    services: ['websites', 'enquiry-workflows'], topics: ['quote-form', 'form-ack', 'failure-recovery'],
    sector: 'Any business with a website form', question: 'What should a form do when it can’t send?',
    purpose: 'Founder-led design choice, as a conversation starter.',
    promise: 'One design rule you can ask any web designer to follow.',
    action: 'Answer in the comments: does your form say who replies, and when?',
    related: [{ id: 'D03-P2', why: 'test your own form' }, { id: 'D42-P1', why: 'failure and recovery, filmed' }],
    next: null,
    hooks: [
      { line: 'Every form I build admits when it can’t send.', why: 'A specific, slightly surprising design principle in the first person.' },
      { line: 'A good form tells the truth.', why: 'Memorable, but too general to act on.' },
    ],
    chosen: 0, whyWins: 'It is specific enough to check against your own site and it is how Mann’s own site works.',
    firstFrame: 'Mann’s real portrait in a rounded frame on near-black, a lime signal line, and the rule in large type beneath.',
    scenario: 'Mann explains a rule from his own site: if a form can’t deliver, the visitor is told and keeps what they typed, with another way to get in touch.',
    payoff: 'A rule the viewer can test on their own site today.',
    art: { dir: 'night', props: 'Mann’s real portrait' },
    labels: [],
    claims: [{ claim: 'On mannpatel.me, if a form can’t deliver, the visitor is told and keeps what they typed, with another way to reach Mann', source: 'mannpatel.me/services/enquiry-follow-up/ (“the same way the forms on this site do”); /contact/ fallback copy' }],
    slides: [
      { layout: 'portrait', src: 'asset:brand/mann-patel-portrait.jpg', band: true, bandH: 720, bandOverlap: 90, meta: false, eyebrow: 'Design note · 01', lines: ['Every form I build', 'admits when', '*it can’t send.*'], size: 76, sub: 'The visitor is told, keeps what they typed, and gets another way to reach you. That’s how my own contact form works.' },
    ],
    coverTitle: 'Every form I build admits when it can’t send',
    caption: `A design rule I don’t bend: every form I build admits when it can’t send.

If a message can’t be delivered, the visitor is told straight away. They keep everything they typed, and they get another way to reach you (an email address, a phone number). No fake “Thanks!” screen. That’s how my own contact form at mannpatel.me works.

Why it matters: a customer who knows a message failed will try again. A customer who thinks it worked will wait, and then quietly go somewhere else.

Your turn: does your form tell people who replies, and by when? Answer in the comments.

${tags('web')}`,
    pinned: 'If you’re not sure, send yourself a test today and read the screen you get.',
    keywords: 'website form design, contact form best practice, Toronto web designer',
  },
];
