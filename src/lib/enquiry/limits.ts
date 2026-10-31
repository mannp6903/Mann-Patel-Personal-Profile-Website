/**
 * Request limits and duplicate protection (in memory).
 *
 * Limitation, documented in docs/05: serverless platforms may run several instances,
 * each with its own memory, so these limits are best-effort per instance. They stop
 * accidental double-sends and casual abuse; Turnstile or the host's rate-limit rules
 * add stronger protection if spam becomes a problem.
 */

export interface Window {
  limit: number;
  seconds: number;
}

export const DEFAULT_WINDOWS: Window[] = [
  { limit: 5, seconds: 10 * 60 },
  { limit: 20, seconds: 24 * 60 * 60 },
];

export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(private windows: Window[] = DEFAULT_WINDOWS, private maxKeys = 5000) {}

  /** Returns 0 when allowed (and records the hit), otherwise seconds until retry. */
  check(key: string, nowMs: number): number {
    const longest = Math.max(...this.windows.map((w) => w.seconds)) * 1000;
    const list = (this.hits.get(key) ?? []).filter((t) => nowMs - t < longest);
    for (const w of this.windows) {
      const inWindow = list.filter((t) => nowMs - t < w.seconds * 1000);
      if (inWindow.length >= w.limit) {
        const oldest = Math.min(...inWindow);
        return Math.max(1, Math.ceil((oldest + w.seconds * 1000 - nowMs) / 1000));
      }
    }
    list.push(nowMs);
    this.hits.set(key, list);
    if (this.hits.size > this.maxKeys) {
      const first = this.hits.keys().next().value;
      if (first !== undefined) this.hits.delete(first);
    }
    return 0;
  }
}

/** Remembers recent submissions so a repeated submit returns the first result instead of sending twice. */
export class Dedupe<T> {
  private seen = new Map<string, { at: number; value: Promise<T> }>();
  constructor(private ttlMs = 24 * 60 * 60 * 1000, private maxKeys = 5000) {}

  get(key: string, nowMs: number): Promise<T> | undefined {
    const hit = this.seen.get(key);
    if (!hit) return undefined;
    if (nowMs - hit.at > this.ttlMs) {
      this.seen.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: Promise<T>, nowMs: number) {
    this.seen.set(key, { at: nowMs, value });
    if (this.seen.size > this.maxKeys) {
      const first = this.seen.keys().next().value;
      if (first !== undefined) this.seen.delete(first);
    }
  }

  delete(key: string) {
    this.seen.delete(key);
  }
}
