/**
 * Love Receipt — inline word-circle markers.
 *
 * A circled/heart-framed word is authored INLINE in a line's text with a
 * `*asterisk*` marker, e.g. `your *hoodie* (im NOT returning)`. The marker rides
 * in the content itself, so it:
 *   - survives edits (it's part of the string, not a separate index),
 *   - matches by CONTENT not position (re-applied by phrase, see applyMarkers),
 *   - deletes gracefully (delete the word and the marker goes with it).
 *
 * PURE STRING HELPERS — no React, no doodle lookups. receipt-paper.tsx parses
 * with {@link parseMarkedText} to render the hollow frame, and love-receipt-
 * doodles.ts maps a marked phrase to a hollow doodle. The on-paper editor uses
 * {@link stripMarkers} / {@link extractMarkedPhrases} / {@link applyMarkers} to
 * show a clean (asterisk-free) input and re-apply markers on every keystroke.
 */

// A fresh global regex per call (matchAll/exec/replace mutate lastIndex on a
// global, so we never share one instance across functions).
const marker = () => /\*([^*]+)\*/g;

/** One piece of a parsed line: a run of plain text or a single marked phrase. */
export interface MarkedSegment {
  text: string;
  marked: boolean;
}

/**
 * Split text into ordered segments, flagging the `*marked*` runs. Unmarked text
 * (including stray lone asterisks) passes through verbatim, so a line with no
 * marker yields a single unmarked segment.
 */
export function parseMarkedText(text: string): MarkedSegment[] {
  const segments: MarkedSegment[] = [];
  const re = marker();
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ text: text.slice(last, m.index), marked: false });
    }
    segments.push({ text: m[1], marked: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), marked: false });
  }
  return segments.length ? segments : [{ text, marked: false }];
}

/** True if the text carries at least one `*marker*`. */
export function hasMarker(text: string): boolean {
  return /\*[^*]+\*/.test(text);
}

/** The display string with markers removed (the asterisks gone, words kept). */
export function stripMarkers(text: string): string {
  return text.replace(marker(), '$1');
}

/** The marked phrases, in order — what the editor remembers to re-apply. */
export function extractMarkedPhrases(text: string): string[] {
  const re = marker();
  const phrases: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) phrases.push(m[1]);
  return phrases;
}

/**
 * Re-wrap each remembered phrase in `text` (which is asterisk-free editor input)
 * with a `*marker*`, matching by content: the FIRST still-present occurrence of
 * each phrase is wrapped. A phrase the user has edited away simply isn't found
 * and its marker is dropped — markers delete gracefully. Already-wrapped phrases
 * are skipped so re-applying is idempotent.
 */
export function applyMarkers(text: string, phrases: readonly string[]): string {
  let out = text;
  for (const phrase of phrases) {
    if (!phrase || out.includes(`*${phrase}*`)) continue;
    const idx = out.indexOf(phrase);
    if (idx === -1) continue; // phrase gone → marker dropped gracefully
    out = `${out.slice(0, idx)}*${phrase}*${out.slice(idx + phrase.length)}`;
  }
  return out;
}
