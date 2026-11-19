/**
 * Missed-call calculator (SEO report follow-up, 19 Nov 2026), on /services/enquiry-follow-up/.
 *
 * The value at stake each month, worked out only from the visitor's own four numbers. There are no default values,
 * no industry averages and no claim about how much a text-back wins back: the result is the visitor's estimate.
 * No imports, so the browser script (src/components/MissedCallCalculator.astro) runs exactly this code.
 *
 *   value a month = calls a week × share missed × 52 weeks ÷ 12 months × share who would have booked × average job
 */

export type FieldName = 'calls' | 'missed' | 'job' | 'booked';

export interface Field {
  name: FieldName;
  label: string;
  hint: string;
  /** Shown after the box: "calls", "%", "CAD". */
  unit: string;
  min: number;
  max: number;
  /** `inputmode` for phones: whole numbers or decimals. */
  mode: 'numeric' | 'decimal';
}

/** In the order they are asked. */
export const FIELDS: readonly Field[] = [
  { name: 'calls', label: 'Calls to your business in a usual week', hint: 'From your phone’s call log.', unit: 'calls', min: 0, max: 1000, mode: 'decimal' },
  { name: 'missed', label: 'Share of those calls you miss', hint: 'Calls nobody picks up, as a percentage.', unit: '%', min: 0, max: 100, mode: 'decimal' },
  { name: 'job', label: 'Your average job or appointment', hint: 'What one booking is usually worth, in Canadian dollars.', unit: 'CAD', min: 0, max: 100000, mode: 'decimal' },
  {
    name: 'booked',
    label: 'Share of missed callers who would have booked',
    hint: 'Your own guess, as a percentage. Not every caller is a customer.',
    unit: '%',
    min: 0,
    max: 100,
    mode: 'decimal',
  },
];

export type Inputs = Record<FieldName, number>;

export type Parsed =
  | { ok: true; value: Inputs }
  | {
      ok: false;
      /** Boxes still empty (no message: the visitor hasn't got to them yet). */
      missing: FieldName[];
      /** Boxes holding something that isn't a number in range, with what to fix. */
      errors: Partial<Record<FieldName, string>>;
    };

/** "1,200", "$180", "30%" and " 12 " all read as numbers; anything else is not a number. */
export function readNumber(raw: string | null | undefined): number | null {
  const text = (raw ?? '').replace(/[\s,$%]/g, '');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(text)) return null;
  return Number(text);
}

/** Checks all four boxes. A value is used only when every box holds a number in its range. */
export function parseInputs(raw: Partial<Record<FieldName, string | null | undefined>>): Parsed {
  const missing: FieldName[] = [];
  const errors: Partial<Record<FieldName, string>> = {};
  const value = {} as Inputs;
  for (const f of FIELDS) {
    const text = (raw[f.name] ?? '').trim();
    if (!text) {
      missing.push(f.name);
      continue;
    }
    const n = readNumber(text);
    if (n === null) errors[f.name] = 'Enter a number, for example 12.';
    else if (n < f.min || n > f.max) errors[f.name] = `Enter a number from ${fmtNumber(f.min)} to ${fmtNumber(f.max)}.`;
    else value[f.name] = n;
  }
  return missing.length || Object.keys(errors).length ? { ok: false, missing, errors } : { ok: true, value };
}

export interface Result {
  /** Missed calls in an average month. */
  missedPerMonth: number;
  /** Of those, the callers who would have booked. */
  bookingsPerMonth: number;
  /** The value of those bookings, in CAD. */
  valuePerMonth: number;
}

/**
 * The arithmetic, multiplied out before dividing so whole-number inputs give exact results
 * (12 calls, 30%, $180, 25% → exactly $702, not 701.9999).
 */
export function calculate(i: Inputs): Result {
  const missedPerMonth = (i.calls * i.missed * 52) / (100 * 12);
  const bookingsPerMonth = (i.calls * i.missed * 52 * i.booked) / (100 * 12 * 100);
  const valuePerMonth = (i.calls * i.missed * 52 * i.booked * i.job) / (100 * 12 * 100);
  return { missedPerMonth, bookingsPerMonth, valuePerMonth };
}

const number = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 });
const about = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 1 });
const dollars = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "$180" for whole dollars, "$180.50" otherwise. */
const fmtJob = (n: number) => (Number.isInteger(n) ? dollars.format(n) : cents.format(n));

export const fmtNumber = (n: number) => number.format(n);

/** "$702 a month" (rounded to the dollar). */
export const fmtValue = (r: Result) => `${dollars.format(r.valuePerMonth)} a month`;

/** "About 15.6 missed calls a month, and 3.9 of those callers would have booked." */
export function fmtDetail(r: Result): string {
  const calls = r.missedPerMonth === 1 ? 'missed call' : 'missed calls';
  return `About ${about.format(r.missedPerMonth)} ${calls} a month, and ${about.format(r.bookingsPerMonth)} of those callers would have booked.`;
}

/**
 * The formula with the visitor's own numbers, shown under the result:
 * "12 calls a week × 30% missed × 52 weeks ÷ 12 months × 25% would have booked × $180 a job = $702 a month".
 */
export function fmtFormula(i: Inputs, r: Result): string {
  return [
    `${fmtNumber(i.calls)} calls a week`,
    `${fmtNumber(i.missed)}% missed`,
    '52 weeks ÷ 12 months',
    `${fmtNumber(i.booked)}% would have booked`,
    `${fmtJob(i.job)} a job`,
  ].join(' × ') + ` = ${fmtValue(r)}`;
}
