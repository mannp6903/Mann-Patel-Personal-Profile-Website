/**
 * The free Found & Answered check is limited to a few a month (Mann, 2 Nov 2026).
 *
 * When this month's free checks are taken, set `fullThisMonth: true` and push (Cloudflare
 * redeploys): the site then says new requests go on next month's list. Set it back to
 * `false` at the start of the next month. The site does not count requests itself.
 * No imports here: this file is shared by the pages, the form and the server.
 */
export const freeCheck = {
  perMonth: 3,
  fullThisMonth: false,
};

export const freeCheckNote = freeCheck.fullThisMonth
  ? `This month’s ${freeCheck.perMonth} free checks are taken. New requests go on next month’s list.`
  : `Limited to ${freeCheck.perMonth} free checks a month, first come, first served.`;

export const freeCheckShort = `${freeCheck.perMonth} a month`;
