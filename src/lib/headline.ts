/**
 * Two-tone headings under the lime budget (design upgrade Phase 1, 17 Nov 2026): the last line steps back to grey and
 * its full stop, if it has one, is the heading's only lime mark. The text is unchanged; only the colour moves.
 */
export function accentLine(line: string): string {
  const stop = line.endsWith('.');
  return `<span class="accent">${stop ? line.slice(0, -1) : line}</span>${stop ? '<span class="stop">.</span>' : ''}`;
}
