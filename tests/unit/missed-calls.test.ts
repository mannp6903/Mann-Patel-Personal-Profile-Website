// Missed-call calculator (SEO report follow-up, 19 Nov 2026): the arithmetic behind the box on
// /services/enquiry-follow-up/. The result comes only from the visitor's four numbers.
import { describe, it, expect } from 'vitest';
import { FIELDS, readNumber, parseInputs, calculate, fmtValue, fmtDetail, fmtFormula } from '../../src/lib/missed-calls';

const filled = { calls: '12', missed: '30', job: '180', booked: '25' };

describe('missed-call calculator: arithmetic', () => {
  it('value a month = calls a week × missed × 52 ÷ 12 × would have booked × average job', () => {
    const r = calculate({ calls: 12, missed: 30, job: 180, booked: 25 });
    // 12 × 0.30 × 52 ÷ 12 = 15.6 missed calls; × 0.25 = 3.9 bookings; × $180 = $702.
    expect(r.missedPerMonth).toBe(15.6);
    expect(r.bookingsPerMonth).toBe(3.9);
    expect(r.valuePerMonth).toBe(702);
  });

  it('agrees with the formula done step by step, for awkward numbers too', () => {
    for (const i of [
      { calls: 7, missed: 13, job: 95.5, booked: 41 },
      { calls: 1000, missed: 100, job: 100000, booked: 100 },
      { calls: 0.5, missed: 1, job: 1, booked: 1 },
    ]) {
      const stepByStep = i.calls * (i.missed / 100) * (52 / 12) * (i.booked / 100) * i.job;
      expect(calculate(i).valuePerMonth).toBeCloseTo(stepByStep, 6);
    }
  });

  it('is zero when any one number is zero, and never negative', () => {
    for (const key of ['calls', 'missed', 'job', 'booked'] as const) {
      const r = calculate({ calls: 12, missed: 30, job: 180, booked: 25, [key]: 0 });
      expect(r.valuePerMonth).toBe(0);
    }
  });

  it('doubles when any one number doubles (each enters once, as a factor)', () => {
    const base = calculate({ calls: 12, missed: 30, job: 180, booked: 25 }).valuePerMonth;
    expect(calculate({ calls: 24, missed: 30, job: 180, booked: 25 }).valuePerMonth).toBe(base * 2);
    expect(calculate({ calls: 12, missed: 60, job: 180, booked: 25 }).valuePerMonth).toBe(base * 2);
    expect(calculate({ calls: 12, missed: 30, job: 360, booked: 25 }).valuePerMonth).toBe(base * 2);
    expect(calculate({ calls: 12, missed: 30, job: 180, booked: 50 }).valuePerMonth).toBe(base * 2);
  });
});

describe('missed-call calculator: reading the boxes', () => {
  it('reads plain numbers, and forgives commas, dollar signs, percent signs and spaces', () => {
    expect(readNumber('12')).toBe(12);
    expect(readNumber(' 12.5 ')).toBe(12.5);
    expect(readNumber('.5')).toBe(0.5);
    expect(readNumber('1,200')).toBe(1200);
    expect(readNumber('$180')).toBe(180);
    expect(readNumber('30%')).toBe(30);
    expect(readNumber('-3')).toBe(-3);
    for (const bad of ['', 'twelve', '12a', '1.2.3', '.', '-', '1e3']) expect(readNumber(bad), bad).toBeNull();
  });

  it('uses the numbers only when all four are filled in and in range', () => {
    const ok = parseInputs(filled);
    expect(ok).toEqual({ ok: true, value: { calls: 12, missed: 30, job: 180, booked: 25 } });
  });

  it('an empty box is "missing", never an error; nothing is filled in for the visitor', () => {
    const r = parseInputs({ calls: '12', missed: '', job: '  ' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.missing).toEqual(['missed', 'job', 'booked']);
      expect(r.errors).toEqual({});
    }
    // No box has a default value.
    expect(parseInputs({})).toEqual({ ok: false, missing: ['calls', 'missed', 'job', 'booked'], errors: {} });
  });

  it('says what to fix: not a number, or out of range (percentages 0 to 100)', () => {
    const r = parseInputs({ ...filled, calls: 'lots', missed: '150', booked: '-5' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.calls).toBe('Enter a number, for example 12.');
      expect(r.errors.missed).toBe('Enter a number from 0 to 100.');
      expect(r.errors.booked).toBe('Enter a number from 0 to 100.');
      expect(r.errors.job).toBeUndefined();
    }
    for (const f of FIELDS) expect(f.min).toBe(0);
    expect(FIELDS.filter((f) => f.unit === '%').map((f) => f.max)).toEqual([100, 100]);
  });
});

describe('missed-call calculator: what it shows', () => {
  it('the result, the detail and the formula with the visitor’s own numbers', () => {
    const p = parseInputs(filled);
    if (!p.ok) throw new Error('expected numbers');
    const r = calculate(p.value);
    expect(fmtValue(r)).toBe('$702 a month');
    expect(fmtDetail(r)).toBe('About 15.6 missed calls a month, and 3.9 of those callers would have booked.');
    expect(fmtFormula(p.value, r)).toBe('12 calls a week × 30% missed × 52 weeks ÷ 12 months × 25% would have booked × $180 a job = $702 a month');
  });

  it('rounds the result to the dollar and shows cents only when the job value has them', () => {
    const i = { calls: 7, missed: 13, job: 95.5, booked: 41 };
    const r = calculate(i);
    // 7 × 13 × 52 × 41 × 95.5 ÷ 120,000 = 154.40
    expect(fmtValue(r)).toBe('$154 a month');
    expect(fmtFormula(i, r)).toContain('× $95.50 a job =');
    expect(fmtValue(calculate({ calls: 1000, missed: 100, job: 100000, booked: 100 }))).toBe('$433,333,333 a month');
  });

  it('makes no claim beyond the visitor’s numbers: no averages, no promises', () => {
    const text = JSON.stringify(FIELDS) + fmtDetail(calculate({ calls: 1, missed: 1, job: 1, booked: 1 }));
    expect(text).not.toMatch(/average (business|salon|cleaner)|studies|on average|guarantee|recover|win back/i);
  });
});
