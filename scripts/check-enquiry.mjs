#!/usr/bin/env node
/**
 * Critical-path check for the enquiry forms (round 10). For the site owner, after Email Routing and
 * the ENQUIRY_TO_EMAIL secret are set up (docs/05 §1).
 *
 *   node scripts/check-enquiry.mjs https://mannpatel.me
 *       Readiness only: is direct delivery connected? Sends nothing.
 *
 *   node scripts/check-enquiry.mjs https://mannpatel.me --send --reply-to you@yourdomain.ca
 *       Also sends ONE free-check request and ONE project brief, both clearly marked
 *       "[Delivery test]", through the real form endpoint. They go to the site's own inbox
 *       (ENQUIRY_TO_EMAIL); --reply-to must be an address you own. Then check that inbox for both.
 *
 * What the results mean (docs/05 §1):
 *   accepted     the website validated the request AND the email provider accepted it for delivery.
 *                This is not proof it reached the inbox: only seeing both emails there is.
 *   rejected     the website refused it (shown with the reason); the visitor would keep their answers.
 *   not ready    readiness says `connected: false`; the forms offer the email-app fallback instead.
 */
const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) ?? '').replace(/\/$/, '');
const send = args.includes('--send');
const replyTo = args[args.indexOf('--reply-to') + 1];

if (!base) {
  console.error('Usage: node scripts/check-enquiry.mjs <site-url> [--send --reply-to you@yourdomain]');
  process.exit(2);
}
if (send && (!replyTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo))) {
  console.error('--send needs --reply-to with an email address you own (the test emails use it as the sender to reply to).');
  process.exit(2);
}

const endpoint = `${base}/api/enquiry/`;
const readiness = async () => {
  const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, connected: body.connected === true, reason: body.reason, token: body.token };
};

let r;
try {
  r = await readiness();
} catch (err) {
  console.error(`Couldn’t reach ${endpoint}: ${err.cause?.code ?? err.message}. Check the address and your connection.`);
  process.exit(1);
}
console.log(`Readiness  ${endpoint}`);
console.log(`  HTTP ${r.status}, connected: ${r.connected}, reason: ${r.reason ?? 'n/a'}`); // the token is never printed
if (!send) {
  console.log(r.connected ? '\nDirect delivery is configured. Add --send --reply-to <your address> to send the two test messages.' : '\nNot connected: the forms offer the email-app fallback. See docs/05 §1.');
  process.exit(r.connected ? 0 : 1);
}
if (!r.connected) {
  console.log('\nNot sending: delivery is not connected yet (docs/05 §1).');
  process.exit(1);
}

const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
const tests = [
  {
    label: 'Free check',
    body: { name: 'Delivery test', email: replyTo, business: `[Delivery test] free check ${stamp}`, packageId: 'check-up', message: '' },
  },
  {
    label: 'Project brief',
    body: {
      name: 'Delivery test',
      email: replyTo,
      business: `[Delivery test] project brief ${stamp}`,
      services: ['not-sure'],
      packageId: '',
      message: `[Delivery test] Sent by scripts/check-enquiry.mjs at ${stamp} to check the project brief reaches the inbox. No reply needed.`,
    },
  },
];

let failures = 0;
for (const t of tests) {
  const { token } = await readiness();
  const submissionId = `check-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  // The form's time check rejects anything sent within a few seconds of loading it, like a person would.
  await new Promise((ok) => setTimeout(ok, 4500));
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...t.body, formToken: token, submissionId }),
  });
  const body = await res.json().catch(() => ({}));
  if (body.ok) {
    console.log(`\n${t.label}: accepted (HTTP ${res.status}), reference ${body.id}${body.duplicate ? ' (duplicate)' : ''}`);
  } else {
    failures++;
    console.log(`\n${t.label}: rejected (HTTP ${res.status}) ${body.code ?? ''}: ${body.message ?? 'no message'}`);
  }
}
console.log(
  failures
    ? '\nAt least one test was rejected: fix that before relying on the form.'
    : '\nBoth accepted by the website and the email provider. Now check the inbox for two emails whose subjects contain "Delivery test". Only that confirms delivery.',
);
process.exit(failures ? 1 : 0);
