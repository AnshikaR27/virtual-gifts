'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  BARCODE_TEXT,
  NEW_LINE_MAX,
  PRICE_MAX,
  type ReceiptPayload,
} from './lines';
import {
  doodleSrc,
  hollowCalibration,
  isRenderableLineDoodle,
  numberFrameCalibration,
  numberWrapForReceipt,
  resolveReceiptDoodles,
  resolveScatter,
  wordDoodle,
  type ResolvedDoodle,
  type ResolvedEndLineDoodle,
  type ScatterZone,
} from './love-receipt-doodles';
import {
  applyMarkers,
  extractMarkedPhrases,
  parseMarkedText,
  stripMarkers,
} from './markers';

/**
 * <ReceiptPaper> — the crumpled thermal-slip receipt, shared by the sender's
 * builder and the recipient's printing animation.
 *
 * Restyled to the Receiptify look: bright white paper, pure-black ink, a very
 * heavy uppercase grotesque header (DELULU MART), an all-monospace body, dashed
 * section rules, a numbered item table (01 / ITEM / PRICE) with right-aligned
 * prices, a bold TOTAL, a left-aligned card block (PAID VIA + fine print), a
 * centered THANK YOU footer and the ILOVEYOU barcode.
 *
 * Doodles attach to content only ON/AROUND it: a hollow frame wraps the QTY
 * digits (number-wrap) or a `*marked*` word (word-circle), and solid motifs
 * scatter through empty structural dead-zones — see ./love-receipt-doodles.
 *
 * The recipient feeds the paper out one row at a time via `printedCount`; the
 * sender passes the full count with `animate={false}`.
 *
 * Pass `editable` to make the receipt its own editor: the store name, each
 * line (text + price, with ✕ delete and ↑↓ reorder), and the total become
 * inline-editable directly on the paper. When `editable` is omitted the output
 * is identical to a plain printed receipt, so the recipient view is untouched.
 */

// ── ink + paper palette (Receiptify: black ink on white thermal paper) ──
const INK = '#1a1a1a';
const INK_SOFT = 'rgba(26, 26, 26, 0.58)';
// dashed section rules — 1px dashed near-black at ~40% opacity
const RULE = 'rgba(26, 26, 26, 0.42)';
// near-white paper
const PAPER = '#fbfbf9';
const EDIT_ACCENT = '#b6303a';
const EDIT_BG = 'rgba(182, 48, 58, 0.07)';
const EDIT_HINT = 'rgba(26, 26, 26, 0.26)';
// Item-line font size, shared by the printed ItemRow and the builder's editable
// row so the two can't drift. (Briefly previewed at 11; kept at 12.5.)
const ITEM_LINE_FONT_SIZE = 12.5;
// Soft periwinkle header band (the Receiptify reference strip behind the store
// name). Light enough that the near-black ink title stays high-contrast on it.
const HEADER_BAND = '#c3c8ee';
// PREVIEW-ONLY: a paler wash of the periwinkle band, used by the header-logo
// comparison view's "softened band" option. Not referenced in production.
const SOFT_HEADER_BAND = '#e1e4f5';

// Very heavy uppercase grotesque for the store header ("RECEIPTIFY" treatment).
const HEADER_FONT =
  "var(--font-archivo-black), 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Everything else is monospace (the Receiptify body look).
const MONO_FONT =
  "var(--font-space-mono), ui-monospace, 'IBM Plex Mono', 'Courier New', Courier, monospace";

// The BARREN SCATTER still uses gentle pastel assets, which read as a faint
// watermark on the crumpled paper. This filter pushes their rendered ink toward
// bold-marker punch — saturated + higher-contrast + a touch darker — without
// changing size or count. Tuned to the DIMMER device: Android/Chrome renders CSS
// filters + color mgmt a notch fainter than iOS Safari, so we push hard enough to
// clear the bar there (iOS comes out a bit punchier, which is fine).
const DOODLE_INK_FILTER = 'saturate(2.0) contrast(1.6) brightness(0.82)';

// The hollow FRAMES (number-wrap + word-circle) now use bold-colored in-asset
// extractions, so the strong scatter filter above would over-cook them — they get
// no boost by default (the asset already carries the colour). The one exception is
// the PERIWINKLE SATURN: it's a naturally lighter, less-saturated colour than the
// coral star or candy heart, so at 'none' it reads fainter on the pale paper. Its
// boost is TUNED (not the obvious saturate/contrast — contrast alone pushes a light
// stroke even lighter): saturate lifts chroma to the others' ~95, and brightness
// 0.82 darkens the periwinkle so its luminance lands between the teal star and
// candy heart. Measured to MATCHED boldness, not neon. Per-doodle, saturn only.
const DEFAULT_DOODLE_FRAME_FILTER = 'none';
const DOODLE_FRAME_FILTER_BY_ID: Record<string, string> = {
  'doodle-saturn-ring': 'saturate(2.2) contrast(1.1) brightness(0.82)',
};
function doodleFrameFilter(doodleId: string): string {
  return DOODLE_FRAME_FILTER_BY_ID[doodleId] ?? DEFAULT_DOODLE_FRAME_FILTER;
}

// Faint paper grain (low-opacity fractal noise) under the ink.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

// ── shared item-table columns (qty / item / price) ─────────────────────
// One geometry for the column header, plain item rows, and the editable rows so
// the numbers, titles and prices line up. Item text wraps inside its own column
// (already inset past the qty column); the price stays top-aligned on the right.
const QTY_COL: CSSProperties = { flex: '0 0 auto', width: '2.2em' };
// ITEM gets all the slack left after QTY + PRICE and wraps WHOLE WORDS only:
// `break-word` + `word-break: normal` keep its min-content = the longest word
// (never 1ch). min-width stays `auto` (NOT 0) so flexbox HONOURS that min-content
// floor — a wide price can no longer squeeze the lane below its longest word and
// force a mid-letter break (HAIRC/UT). No word is ever split mid-letter. (#2's
// one-word-per-line price keeps the price column narrow so this can't overflow.)
const ITEM_COL: CSSProperties = {
  flex: '1 1 auto',
  overflowWrap: 'break-word',
  wordBreak: 'normal',
};
// PRICE is its OWN right-aligned lane, taking only as much as its content needs
// (flex 0 0 auto, no shrink). Because ITEM flex-grows, every price pins to the
// same right edge. No maxWidth grab (that starved ITEM into a tower before);
// whole-word wrap keeps PROCESSING / BOOKMARKED from splitting mid-letter.
const PRICE_COL: CSSProperties = {
  flex: '0 0 auto',
  paddingLeft: '0.6em',
  textAlign: 'right',
  overflowWrap: 'break-word',
  wordBreak: 'normal',
};

// ── edit-on-receipt contract ───────────────────────────────────────────
export interface ReceiptEditable {
  /** id of the line being edited inline (null = none). */
  activeLineId: string | null;
  onActivateLine: (id: string | null) => void;
  editingStore: boolean;
  onActivateStore: (editing: boolean) => void;
  editingTotal: boolean;
  onActivateTotal: (editing: boolean) => void;
  onChangeStore: (value: string) => void;
  onChangeTotal: (value: string) => void;
  onChangeLine: (id: string, field: 'text' | 'price', value: string) => void;
  onDeleteLine: (id: string) => void;
  onMoveLine: (id: string, dir: -1 | 1) => void;
  /** shown in the items area when there are no lines yet. */
  emptyHint?: string;
}

// ── reveal sequence (shared shape for paper + printing pacing) ─────────
type RowKind =
  | 'header'
  | 'rule'
  | 'meta'
  | 'item'
  | 'emptyhint'
  | 'summary'
  | 'total'
  | 'fineprint'
  | 'footer'
  | 'barcode';

interface SeqRow {
  kind: RowKind;
  /** index into payload.lines for item rows */
  lineIndex?: number;
  /** which summary row for summary kind */
  summary?: 'subtotal' | 'discount' | 'tax';
  /**
   * Leading rows that sit inside the periwinkle header band. Must stay a
   * contiguous run from the top of the sequence — ReceiptPaper wraps them in a
   * single full-bleed banded container.
   */
  band?: boolean;
}

export function buildSequence(
  payload: ReceiptPayload,
  opts?: { showEmptyHint?: boolean },
): SeqRow[] {
  const items: SeqRow[] = payload.lines.map((_, lineIndex) => ({
    kind: 'item',
    lineIndex,
  }));
  const itemSection: SeqRow[] =
    items.length > 0
      ? items
      : opts?.showEmptyHint
        ? [{ kind: 'emptyhint' }]
        : [];

  return [
    // only the header (store name + subtitle) sits in the periwinkle band; the
    // band ends just below the subtitle (see SeqRow.band)
    { kind: 'header', band: true },
    { kind: 'rule' },
    { kind: 'meta' },
    { kind: 'rule' },
    ...itemSection,
    { kind: 'rule' },
    { kind: 'summary', summary: 'subtotal' },
    { kind: 'summary', summary: 'discount' },
    { kind: 'summary', summary: 'tax' },
    { kind: 'rule' },
    { kind: 'total' },
    { kind: 'rule' },
    { kind: 'fineprint' },
    { kind: 'rule' },
    { kind: 'barcode' },
    { kind: 'footer' },
  ];
}

/** Row count + the index of the TOTAL row (for the comic pre-total pause). */
export function getSequenceMeta(payload: ReceiptPayload): {
  count: number;
  totalIndex: number;
} {
  const seq = buildSequence(payload);
  return {
    count: seq.length,
    totalIndex: seq.findIndex((r) => r.kind === 'total'),
  };
}

interface ReceiptPaperProps {
  payload: ReceiptPayload;
  /** Rows 0..printedCount-1 are shown. Defaults to all rows. */
  printedCount?: number;
  /** Animate each row in as it appears (printing). Off for the builder. */
  animate?: boolean;
  /** Turn the receipt into its own editor (sender builder). */
  editable?: ReceiptEditable;
  /** PREVIEW-ONLY: force per-line resolved doodles (aligned to payload.lines),
   *  bypassing resolveReceiptDoodles. Used by the /g/preview candidates view to
   *  show unbound doodle candidates at true receipt size; unused in production. */
  lineDoodleOverride?: (ResolvedDoodle | null)[];
  /** PREVIEW-ONLY: replace just the header block (logo + band) while the body
   *  renders byte-for-byte as production. `node` is drawn in place of the
   *  default <Header>; `band` picks the strip treatment ('solid' = the current
   *  periwinkle, 'soft' = a paler wash, 'none' = bare paper). Undefined = the
   *  exact production header. Used only by the /g/preview logo-comparison view;
   *  unused in production. */
  headerPreview?: {
    node: ReactNode;
    band: 'solid' | 'soft' | 'none';
    /** merged onto the band wrapper (e.g. a paler background or a crisp bottom
     *  edge) for the header-tweak comparison view. */
    bandStyle?: CSSProperties;
  };
  style?: CSSProperties;
}

export function ReceiptPaper({
  payload,
  printedCount,
  animate = false,
  editable,
  lineDoodleOverride,
  headerPreview,
  style,
}: ReceiptPaperProps) {
  const seq = buildSequence(payload, { showEmptyHint: !!editable });
  const shown = printedCount ?? seq.length;
  // Number-wrap doodles are decided PER RECEIPT (heart is a rare per-receipt
  // surprise), so resolve the whole column once and index by lineIndex below.
  const numberWraps = numberWrapForReceipt(payload.lines);
  // Line marks (hand bindings + rule engine + governors) are ALSO whole-receipt
  // decisions (coverage cap, adjacency, no-repeat), so resolve once and index below.
  const lineDoodles =
    lineDoodleOverride ?? resolveReceiptDoodles(payload.lines);

  // Leading contiguous run of band rows (just the header). It gets wrapped in a
  // full-bleed periwinkle container so the band ends right below the subtitle.
  let bandCount = 0;
  while (bandCount < seq.length && seq[bandCount].band) bandCount++;
  const bandShown = Math.min(shown, bandCount);

  return (
    <div
      style={{
        position: 'relative',
        width: 'min(300px, 86vw)',
        filter: 'drop-shadow(0 12px 22px rgba(0, 0, 0, 0.18))',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          background: PAPER,
          backgroundImage: GRAIN,
          // clean straight rectangular edges (no torn/deckle treatment)
          // narrow centered slip with generous side padding
          padding: '28px 22px 26px',
          color: INK,
          // soft gray edge vignette for the white paper
          boxShadow: 'inset 0 0 36px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Crumple overlay (multiply): a real crumpled-paper texture so the
            creases match the Receiptify reference. Opacity is the tuning knob —
            nudged down (0.9 → 0.82) so the texture mutes the doodles less and
            their ink reads bolder, especially on dimmer Android rendering. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: "url('/textures/crumpled-paper.jpg')",
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'multiply',
            opacity: 0.82,
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* PREVIEW-ONLY: bare-paper custom header (no band strip). */}
          {bandShown > 0 && headerPreview && headerPreview.band === 'none' ? (
            <div style={{ position: 'relative', marginBottom: 8 }}>
              {headerPreview.node}
            </div>
          ) : bandShown > 0 ? (
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                background:
                  headerPreview?.band === 'soft'
                    ? SOFT_HEADER_BAND
                    : HEADER_BAND,
                // Full-bleed: negative margins cancel the paper's 28px top / 22px
                // side padding so the band runs flush to the paper edges (a
                // printed strip, not a floating rectangle). Inner padding gives
                // the content breathing room; the band ends here, just above the
                // dashed rule before the items.
                marginTop: -28,
                marginLeft: -22,
                marginRight: -22,
                padding: '20px 22px 12px',
                ...headerPreview?.bandStyle,
              }}
            >
              {/* crease on top of the band color. The texture is near-white, so
                  plain multiply is invisible on a coloured base and hard-light
                  washes it out. Instead we RE-CENTER the texture to mid-grey
                  (brightness ~0.5) so its flat areas are neutral and leave the
                  purple untouched, then hard-light embosses only the actual fold
                  lines — darker valleys + brighter ridges — for real relief that
                  keeps the colour. Cropped to the texture's creased centre. */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundImage: "url('/textures/crumpled-paper.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  mixBlendMode: 'hard-light',
                  filter: 'brightness(0.58) contrast(2.2)',
                  opacity: 0.9,
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                {headerPreview
                  ? headerPreview.node
                  : seq.slice(0, bandShown).map((row, i) => (
                      <Row key={i} animate={animate}>
                        {renderRow(
                          row,
                          payload,
                          editable,
                          numberWraps,
                          lineDoodles,
                        )}
                      </Row>
                    ))}
              </div>
            </div>
          ) : null}
          {shown > bandCount
            ? seq.slice(bandCount, shown).map((row, i) => (
                <Row key={bandCount + i} animate={animate}>
                  {renderRow(row, payload, editable, numberWraps, lineDoodles)}
                </Row>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

// ── one revealable row ─────────────────────────────────────────────────
function Row({
  animate,
  children,
}: {
  animate: boolean;
  children: React.ReactNode;
}) {
  if (!animate) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: -7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function renderRow(
  row: SeqRow,
  payload: ReceiptPayload,
  editable: ReceiptEditable | undefined,
  numberWraps: (string | null)[],
  lineDoodles: (ResolvedDoodle | null)[],
): React.ReactNode {
  switch (row.kind) {
    case 'header':
      return (
        <ScatterWrap zone="header">
          <Header payload={payload} editable={editable} />
        </ScatterWrap>
      );
    case 'rule':
      return <Rule banded={row.band} />;
    case 'meta':
      return <MetaBlock payload={payload} />;
    case 'emptyhint':
      return (
        <EmptyHint
          text={editable?.emptyHint ?? 'tap a starter line below ✨'}
        />
      );
    case 'item': {
      const line = payload.lines[row.lineIndex!];
      // The QTY/ITEM/PRICE column header (with its lower dashed rule) prints atop
      // the first item — its upper rule is the sequence rule just before items.
      const header = row.lineIndex === 0 ? <ItemsHeader /> : null;
      // The line's ONE mark (hand binding → rule engine → governors), resolved for
      // the whole receipt and indexed here. null when the line is bare. Same for
      // the number-wrap (a separate qty-digit layer).
      const doodle = lineDoodles[row.lineIndex!] ?? null;
      const wrapDoodleId = numberWraps[row.lineIndex!] ?? null;
      const body = editable ? (
        <EditableItem
          line={line}
          index={row.lineIndex!}
          count={payload.lines.length}
          editable={editable}
          doodle={doodle}
          wrapDoodleId={wrapDoodleId}
        />
      ) : (
        <ItemRow
          text={line.text}
          price={line.price}
          index={row.lineIndex!}
          doodle={doodle}
          wrapDoodleId={wrapDoodleId}
        />
      );
      return (
        <>
          {header}
          {body}
        </>
      );
    }
    case 'summary': {
      const r = payload[row.summary!];
      // ITEM COUNT (a derived line, not a payload field) leads the summary block.
      const itemCount =
        row.summary === 'subtotal' ? (
          <SummaryRow label="Item count" value={String(payload.lines.length)} />
        ) : null;
      return (
        <>
          {itemCount}
          <SummaryRow label={r.label} value={r.price} />
        </>
      );
    }
    case 'total':
      // TOTAL sits adjacent to the variable center body — no scatter here (a
      // motif could collide with the last item line on a long draw).
      return (
        <TotalRow
          total={payload.total}
          paidVia={payload.paidVia}
          editable={editable}
        />
      );
    case 'fineprint':
      return <FinePrint payload={payload} />;
    case 'footer':
      // Scatter needs the footer's box to anchor to; skip it on an empty footer.
      return payload.footer ? (
        <ScatterWrap zone="footer">
          <Footer payload={payload} />
        </ScatterWrap>
      ) : (
        <Footer payload={payload} />
      );
    case 'barcode':
      return (
        <ScatterWrap zone="barcode">
          <Barcode scanLine={payload.scanLine} />
        </ScatterWrap>
      );
    default:
      return null;
  }
}

// (The old column-level underline `DoodleMark` was removed — underline is now a
// WORD-level mark drawn by WordMark/WordUnderline, exactly like circle-word.)

// ── end-of-line doodle — a small motif after the line text ──────────────
/**
 * A small hand-authored doodle tucked in just after the line's text, before the
 * price column — the ?! / <3 of a cute paper receipt. Rendered INLINE at the end
 * of the text flow, so it rides at the tail of the last wrapped row and sits in
 * the line's empty space; sized in em so it tracks the row's font size. Solid
 * motif art, so it takes the same ink boost as the barren scatter.
 */
// Per-doodle width/height ratio (w/h) so an end-mark box HUGS its glyph instead of
// padding a narrow "?" or "!" inside a square (which is what pushed them apart).
// Unlisted marks default to square.
const END_MARK_ASPECT: Record<string, number> = {
  'doodle-question-mark': 0.62,
  'doodle-single-exclaim': 0.3,
  'doodle-math-heart': 1.45, // extracted-asset aspect (800×553 via extract-doodles.py)
  'doodle-rays-mustard': 1.05, // corrected to the real PNG aspect (800×761) — was 0.84, which letterboxed it
  'doodle-exclaim-question': 0.84, // combined "?!" — extracted 671×800
};

// Per-doodle inline height in em. Most end-marks read at ~cap height so they sit
// like punctuation. The math-heart asset is WIDE (aspect ~1.79), so width =
// height × 1.79 — height is the lever that controls how much it dominates the row.
// 0.8em reproduces the original small "<3 as punctuation" render (the old asset
// looked ~0.77em tall via a narrow letterboxed box; we get the same size directly
// now that the aspect is correct). Unlisted marks fall back to DEFAULT.
const DEFAULT_END_MARK_HEIGHT_EM = 1.05;
const END_MARK_HEIGHT_EM: Record<string, number> = {
  'doodle-math-heart': 1.0,
  'doodle-rays-mustard': 1.3,
};

// End-mark ink. The small faint punctuation marks (?! / rays / sparkle) get the
// bold-marker boost so they don't read as a watermark; the big math-heart shows
// its OWN PNG colour (no boost), matching the QTY number-wrap hearts. Unlisted
// marks fall back to the shared DOODLE_INK_FILTER.
const END_MARK_INK: Record<string, string> = {
  'doodle-math-heart': 'none',
};

function EndLineDoodle({
  doodle,
  tight = false,
}: {
  doodle: ResolvedEndLineDoodle;
  /** the second mark of a pair (?!): tuck it right up against the first. */
  tight?: boolean;
}) {
  const src = doodleSrc(doodle.doodleId);
  if (!src) return null;
  // Height per-doodle (see END_MARK_HEIGHT_EM); width follows the glyph's aspect so
  // the box isn't padded. A tall mark (the big math-heart) is vertically CENTERED
  // on the text instead of baseline-tucked so it doesn't crash into the row above.
  const h =
    (END_MARK_HEIGHT_EM[doodle.doodleId] ?? DEFAULT_END_MARK_HEIGHT_EM) *
    doodle.scale; // em
  const w = h * (END_MARK_ASPECT[doodle.doodleId] ?? 1);
  const tall = h > 1.6;
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        position: 'relative',
        width: `${w}em`,
        height: `${h}em`,
        // snug right after the last word; the pair's 2nd glyph pulls IN (negative)
        // to offset each PNG's transparent margin so "?!" reads as one tight unit.
        marginLeft: tight ? '-0.08em' : '0.15em',
        verticalAlign: tall ? 'middle' : '-0.1em',
        pointerEvents: 'none',
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="40px"
        draggable={false}
        style={{
          objectFit: 'contain',
          filter: END_MARK_INK[doodle.doodleId] ?? DOODLE_INK_FILTER,
          transform: doodle.rotation
            ? `rotate(${doodle.rotation}deg)`
            : undefined,
        }}
      />
    </span>
  );
}

/**
 * A punctuate-after mark: the doodle tucked after the item text, plus its optional
 * pair drawn tight against it (the exclaim of a "?!"). One logical mark per line.
 */
function EndMark({ doodle }: { doodle: ResolvedDoodle }) {
  if (!doodle.pairWith) return <EndLineDoodle doodle={doodle} />;
  // nowrap so the two glyphs of a "?!" never split across a line wrap — the pair
  // still moves to the next line together when it doesn't fit after the text.
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <EndLineDoodle doodle={doodle} />
      <EndLineDoodle
        doodle={{
          doodleId: doodle.pairWith,
          scale: doodle.scale,
          rotation: doodle.rotation,
        }}
        tight
      />
    </span>
  );
}

/**
 * Item text with its end-mark GLUED to the final word. The last whitespace-
 * delimited token and the mark are wrapped in a `white-space: nowrap` span, so
 * line-breaking can never orphan the mark on a row of its own — the pair either
 * sits after the last word or wraps down TOGETHER with it. Everything before the
 * last word still wraps normally (only the final word+mark unit is non-breaking).
 *
 * With no end-mark this is just {@link MarkedText}. When a mark is present the
 * text is plain (end-mark and circle-word are mutually exclusive anchors, and
 * word-circle is disabled), so we strip markers and split the plain string —
 * avoiding any chance of slicing through a `*marked*` phrase.
 */
function ItemTextWithEndMark({
  text,
  endMark,
}: {
  text: string;
  endMark: ResolvedDoodle | null;
}) {
  if (!endMark) return <MarkedText text={text} />;
  const plain = stripMarkers(text);
  // head = everything up to (and including) the last space; lastWord = final token.
  const m = plain.match(/^([\s\S]*?)(\S+)\s*$/);
  if (!m) {
    // no splittable word (empty / all-space) — keep text + mark together inline.
    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        {plain}
        <EndMark doodle={endMark} />
      </span>
    );
  }
  const [, head, lastWord] = m;
  return (
    <>
      {head}
      <span style={{ whiteSpace: 'nowrap' }}>
        {lastWord}
        <EndMark doodle={endMark} />
      </span>
    </>
  );
}

// ── hollow frame — wraps a number (number-wrap) or a word (word-circle) ──
/**
 * An outline-only doodle mounted as an absolutely-positioned child of a
 * `position: relative` host (the QTY-digits span or a marked word's span). It
 * overlays the host's box exactly (inset:0), then a PER-DOODLE transform centers
 * and sizes the frame ON the content: `objectFit: fill` stretches the art to the
 * content box so the frame tracks the digits'/word's width, and the calibration's
 * scaleX/scaleY/nudge (see HOLLOW_CALIBRATION) grow it past the content for
 * breathing room and correct each PNG's off-center hollow.
 *
 * Because it overlays the host box, a framed word moves and re-wraps with the
 * surrounding line for free, and the same config wraps a number or a word.
 */
function HollowFrame({
  doodleId,
  scale = 1,
}: {
  doodleId: string;
  /** extra multiplier on the calibrated snug fit (binding.scale; default 1). */
  scale?: number;
}) {
  const src = doodleSrc(doodleId);
  if (!src) return null;
  const c = hollowCalibration(doodleId);
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${c.nudgeX}%, ${c.nudgeY}%) scale(${c.scaleX * scale}, ${c.scaleY * scale})`,
        transformOrigin: 'center',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="80px"
        draggable={false}
        style={{ objectFit: 'fill', filter: doodleFrameFilter(doodleId) }}
      />
    </span>
  );
}

/**
 * The number-wrap frame around the 2-digit QTY. Unlike the word-circle, it keeps
 * the doodle's NATURAL aspect ratio (a saturn ring stays round, a star stays a
 * star) and centers on the digits' visual center — it does NOT inherit the
 * wide-short QTY text box. Implementation:
 *   - a SQUARE box, sized in em from NUMBER_FRAME_CALIBRATION.scale (so it tracks
 *     the digit font size and is correct on any screen),
 *   - pinned at left/top 50% then translate(-50%, -50%) so its center sits on the
 *     host box center (the digits), plus a small per-doodle em nudge,
 *   - object-fit: contain → the art scales UNIFORMLY inside the square and never
 *     stretches (the saturn just letterboxes vertically, keeping its round shape).
 */
function NumberFrame({ doodleId }: { doodleId: string }) {
  const src = doodleSrc(doodleId);
  if (!src) return null;
  const c = numberFrameCalibration(doodleId);
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: `${c.scale}em`,
        height: `${c.scale}em`,
        transform: `translate(-50%, -50%) translate(${c.nudgeX}em, ${c.nudgeY}em)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="80px"
        draggable={false}
        style={{ objectFit: 'contain', filter: doodleFrameFilter(doodleId) }}
      />
    </span>
  );
}

/**
 * The QTY cell: the zero-padded line number, with the receipt's resolved number
 * frame (or none) wrapping the digits. The digits sit in a relative, z-indexed
 * span so the frame rides behind them and they stay legible.
 */
function QtyCell({
  index,
  doodleId,
}: {
  index: number;
  doodleId: string | null;
}) {
  const label = String(index + 1).padStart(2, '0');
  return (
    <span style={QTY_COL}>
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
        {doodleId ? <NumberFrame doodleId={doodleId} /> : null}
      </span>
    </span>
  );
}

// word-circle render disabled pending asset confirmation — re-enable by flipping
// this to true to re-mount the hollow circle around each *marked* word in
// MarkedText below. KEPT INTACT meanwhile: the *markers* in the pool text, the
// markers.ts parser, the wordDoodle() lookup, and HOLLOW_WRAP_PALETTE — so
// circling resumes the moment this flag goes back on, with no other changes.
const WORD_CIRCLE_ENABLED = false;

/**
 * Renders a line's text with any inline `*marked*` word framed by a hollow doodle
 * (word-circle / inside-a-shape). The frame is chosen by phrase content so it's
 * stable across preview/print and varies (circle vs heart vs star) by word. Each
 * marked word is an inline-block relative span so the doodle wraps just that word
 * and travels with it as the line re-wraps; the word rides above the frame.
 *
 * NOTE: word-circle is currently DISABLED ({@link WORD_CIRCLE_ENABLED} === false)
 * — a marked word renders as plain text (asterisks already stripped by the
 * parser) and NO hollow PNG is requested. Flip the flag to restore the circle.
 */
function MarkedText({ text }: { text: string }) {
  const segments = parseMarkedText(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.marked ? (
          <span
            key={i}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>{seg.text}</span>
            {/* re-enable the marker-driven circle by setting WORD_CIRCLE_ENABLED
                = true above; the author-bound word marks are WordMark below */}
            {WORD_CIRCLE_ENABLED ? (
              <HollowFrame doodleId={wordDoodle(seg.text)} />
            ) : null}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

/**
 * Word-level line mark: splits `text` at the first case-insensitive occurrence of
 * `binding.target` and marks JUST that word (or price tag), sized to the word's own
 * box. The word rides above the mark (zIndex 1), fully readable. By anchor:
 *   circle-word / circle-price → a hollow frame around the word ({@link HollowFrame})
 *   underline                  → an underline stroke under the word ({@link WordUnderline})
 * A binding whose doodle doesn't match its anchor, or whose target is missing/not
 * found, is ignored and the text renders plain.
 */
function WordMark({
  text,
  binding,
}: {
  text: string;
  binding: ResolvedDoodle;
}) {
  const renderable = isRenderableLineDoodle(binding);
  const isUnderline = binding.anchor === 'underline';
  const segs = splitAtWord(text, binding.target);
  return (
    <>
      {segs.map((seg, i) =>
        seg.marked && renderable ? (
          <span
            key={i}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>{seg.text}</span>
            {isUnderline ? (
              <WordUnderline
                doodleId={binding.doodleId}
                scale={binding.scale}
              />
            ) : (
              <HollowFrame doodleId={binding.doodleId} scale={binding.scale} />
            )}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

/**
 * The underline stroke under a single wrapped word: an absolutely-positioned child
 * of the word's relative inline-block span, spanning the word's width (with a hair
 * of overhang) and sitting just below its baseline. objectFit:fill stretches the
 * brush PNG to the word width; offsets are in em so it tracks the font size.
 */
function WordUnderline({
  doodleId,
  scale = 1,
}: {
  doodleId: string;
  scale?: number;
}) {
  const src = doodleSrc(doodleId);
  if (!src) return null;
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        // small horizontal overhang so the stroke reads hand-drawn past the word
        left: '-8%',
        right: '-8%',
        // sit just under the baseline: the stroke's TOP lands a hair below the
        // letters (not through them = too high, not floating below = too low).
        // objectFit:fill squishes the ~800×103 brush into this box, so too short a
        // box renders the stroke hairline-thin. Taller box = bolder stroke; bottom
        // drops negative to keep the stroke's visual CENTER put as it grows.
        bottom: `${-0.07 * scale}em`,
        height: `${0.58 * scale}em`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="80px"
        draggable={false}
        style={{ objectFit: 'fill', filter: doodleFrameFilter(doodleId) }}
      />
    </span>
  );
}

/** Split text into [before, target, after], flagging the target run. Matches the
 *  FIRST case-insensitive occurrence and preserves the source casing. Falls back
 *  to a single unmarked segment when the target is missing/empty. */
function splitAtWord(
  text: string,
  target?: string,
): { text: string; marked: boolean }[] {
  if (!target) return [{ text, marked: false }];
  const idx = text.toLowerCase().indexOf(target.toLowerCase());
  if (idx === -1) return [{ text, marked: false }];
  const out: { text: string; marked: boolean }[] = [];
  if (idx > 0) out.push({ text: text.slice(0, idx), marked: false });
  out.push({ text: text.slice(idx, idx + target.length), marked: true });
  if (idx + target.length < text.length) {
    out.push({ text: text.slice(idx + target.length), marked: false });
  }
  return out;
}

/**
 * Wraps a structural row (header / barcode / footer) with always-on barren
 * scatter: solid motifs + light accents pinned to the row's dead-zone corners,
 * BEHIND the row's text (which rides zIndex 1). Content-blind and identical on
 * every receipt — never in the variable center body or a row's side gutter.
 */
function ScatterWrap({
  zone,
  children,
}: {
  zone: ScatterZone;
  children: React.ReactNode;
}) {
  const placements = resolveScatter(zone);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      {placements.map((p, i) => {
        const src = doodleSrc(p.doodleId);
        if (!src) return null;
        return (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              ...p.pos,
              width: p.size,
              height: p.size,
              opacity: p.opacity ?? 0.9,
              transform: p.rotation ? `rotate(${p.rotation}deg)` : undefined,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <Image
              src={src}
              alt=""
              width={p.size}
              height={p.size}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: DOODLE_INK_FILTER,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}

// ── pieces ─────────────────────────────────────────────────────────────
function Header({
  payload,
  editable,
}: {
  payload: ReceiptPayload;
  editable?: ReceiptEditable;
}) {
  // The big black "RECEIPTIFY" treatment: heavy uppercase grotesque, tight
  // tracking, pure black — the heaviest thing on the page. Sized + tracked so
  // the fixed "DELULU MART" wordmark holds on ONE line (never wraps) down to the
  // narrowest phone: nowrap guards the single line, 26px/-1px keeps it inside
  // the band at the 300px paper cap (and below) with margin to spare.
  const storeStyle: CSSProperties = {
    fontFamily: HEADER_FONT,
    fontWeight: 900,
    fontSize: 26,
    lineHeight: 1.02,
    letterSpacing: '-1px',
    textTransform: 'uppercase',
    color: INK,
    whiteSpace: 'nowrap',
  };

  // The periwinkle band is painted by ReceiptPaper's banded wrapper (it spans
  // just the header); the Header itself is the centered title + plain subtitle
  // that sit on top of it.
  return (
    <div style={{ textAlign: 'center', marginBottom: 8 }}>
      {editable ? (
        editable.editingStore ? (
          <input
            autoFocus
            value={payload.storeName}
            maxLength={40}
            onChange={(e) => editable.onChangeStore(e.target.value)}
            onBlur={() => editable.onActivateStore(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') editable.onActivateStore(false);
            }}
            style={{
              ...storeStyle,
              fontSize: 26,
              width: '100%',
              textAlign: 'center',
              background: EDIT_BG,
              border: 'none',
              borderBottom: `2px solid ${EDIT_ACCENT}`,
              outline: 'none',
              padding: '2px 4px',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => editable.onActivateStore(true)}
            style={{
              ...storeStyle,
              display: 'block',
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px dashed ${EDIT_HINT}`,
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            {payload.storeName}
          </button>
        )
      ) : (
        <div style={storeStyle}>{payload.storeName}</div>
      )}

      {payload.subtitle ? (
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 10.5,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: INK_SOFT,
            marginTop: 6,
          }}
        >
          {payload.subtitle}
        </div>
      ) : null}
    </div>
  );
}

// ── meta block — left-aligned uppercase mono lines ─────────────────────
function MetaBlock({ payload }: { payload: ReceiptPayload }) {
  const row: CSSProperties = {
    fontFamily: MONO_FONT,
    fontSize: 12,
    lineHeight: 1.55,
    color: INK,
    textTransform: 'uppercase',
  };
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={row}>Cashier: {payload.cashier}</div>
      <div style={row}>Billed to: {payload.billedTo}</div>
      <div style={row}>Bill #{payload.billNumber}</div>
      {payload.gstin ? <div style={row}>GSTIN: {payload.gstin}</div> : null}
    </div>
  );
}

function Rule({ banded }: { banded?: boolean }) {
  // Inside the header band we want one continuous block of color with no dashed
  // line splitting the title from the meta — render a thin transparent spacer so
  // the print-reveal step is preserved but nothing is drawn.
  if (banded) return <div style={{ height: 2 }} />;
  return <div style={{ borderTop: `1px dashed ${RULE}`, margin: '8px 0' }} />;
}

// ── QTY / ITEM / PRICE column header + its lower dashed rule ────────────
function ItemsHeader() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.7em',
          fontFamily: MONO_FONT,
          fontSize: 11,
          letterSpacing: '0.5px',
          lineHeight: 1.4,
          color: INK,
          textTransform: 'uppercase',
          padding: '1px 0',
        }}
      >
        <span style={QTY_COL}>Qty</span>
        <span style={ITEM_COL}>Item</span>
        <span style={PRICE_COL}>Price</span>
      </div>
      <div style={{ borderTop: `1px dashed ${RULE}`, margin: '6px 0' }} />
    </>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: MONO_FONT,
        fontSize: 12,
        color: INK_SOFT,
        textAlign: 'center',
        padding: '16px 6px',
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

/**
 * QTY | ITEM | PRICE body shared by the printed ItemRow and the builder's
 * EditableItem (non-active branch), so the two render identically and can't drift.
 * Three real flex columns: a fixed-width QTY cell (carrying the number-wrap
 * doodle), the ITEM lane (flex-grows, whole-word wrap), and the PRICE lane — its
 * own right-aligned column, NOT floated, so item text never wraps beneath a price.
 *
 * Doodle seating stays per-column: number-wrap rides the QTY digits (QtyCell),
 * circle-word / underline sit on the ITEM text (WordMark / MarkedText), the
 * end-mark (!? / <3) trails the item text inside the ITEM lane, and circle-price
 * hugs the price inside the PRICE lane. Each column span is `position: relative`
 * so those overlay doodles anchor to their own column, not the whole row.
 */
function ItemRowBody({
  text,
  price,
  index,
  wrapDoodleId,
  doodle,
}: {
  text: string;
  price: string;
  index: number;
  wrapDoodleId: string | null;
  doodle?: ResolvedDoodle | null;
}) {
  const { itemMark, priceMark, endMark } = routeLineMark(doodle);
  return (
    <>
      <QtyCell index={index} doodleId={wrapDoodleId} />
      <span style={{ ...ITEM_COL, position: 'relative' }}>
        {itemMark ? (
          <WordMark text={text} binding={itemMark} />
        ) : (
          // end-mark glued to the last word so it can't orphan onto its own line
          <ItemTextWithEndMark text={text} endMark={endMark} />
        )}
      </span>
      <span style={{ ...PRICE_COL, position: 'relative' }}>
        <PriceCell price={price} priceMark={priceMark} />
      </span>
    </>
  );
}

/**
 * Price-cell content. A single-word price renders inline as before (with its
 * optional circle-price mark). A MULTI-word price stacks ONE WORD PER LINE,
 * right-aligned and top-aligned with the item's first line, so a two-word price
 * ("SANTOOR TAX") stops taking a wide single line and starving the item column.
 * Each word still passes through WordMark, so the circle-price doodle frames only
 * the word matching the binding target and the rest render plain.
 */
function PriceCell({
  price,
  priceMark,
}: {
  price: string;
  priceMark: ResolvedDoodle | null;
}) {
  const words = price.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return priceMark ? (
      <WordMark text={price} binding={priceMark} />
    ) : (
      <>{price}</>
    );
  }
  return (
    <>
      {words.map((w, i) => (
        <span key={i} style={{ display: 'block' }}>
          {priceMark ? <WordMark text={w} binding={priceMark} /> : w}
        </span>
      ))}
    </>
  );
}

// ── numbered item row: 01  ITEM (wraps under itself)  PRICE (right) ────
function ItemRow({
  text,
  price,
  index,
  wrapDoodleId,
  doodle,
}: {
  text: string;
  price: string;
  index: number;
  wrapDoodleId: string | null;
  /** the line's one resolved mark: underline | circle-word | circle-price |
   *  punctuate-after (or none). */
  doodle?: ResolvedDoodle | null;
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.7em',
        fontFamily: MONO_FONT,
        fontSize: ITEM_LINE_FONT_SIZE,
        lineHeight: 1.5,
        color: INK,
        textTransform: 'uppercase',
        padding: '2px 0',
      }}
    >
      <ItemRowBody
        text={text}
        price={price}
        index={index}
        wrapDoodleId={wrapDoodleId}
        doodle={doodle}
      />
    </div>
  );
}

/**
 * Route a line's single resolved mark to the right slot by anchor:
 *   itemMark  — circle-word / underline → a word in the ITEM text (WordMark)
 *   priceMark — circle-price            → a word in the PRICE column (WordMark)
 *   endMark   — punctuate-after         → a small motif AFTER the item text
 */
function routeLineMark(doodle?: ResolvedDoodle | null): {
  itemMark: ResolvedDoodle | null;
  priceMark: ResolvedDoodle | null;
  endMark: ResolvedDoodle | null;
} {
  const itemMark =
    doodle && (doodle.anchor === 'circle-word' || doodle.anchor === 'underline')
      ? doodle
      : null;
  const priceMark = doodle?.anchor === 'circle-price' ? doodle : null;
  const endMark = doodle?.anchor === 'punctuate-after' ? doodle : null;
  return { itemMark, priceMark, endMark };
}

// ── editable line: tap to expand into an inline editor on the paper ─────
function EditableItem({
  line,
  index,
  count,
  editable,
  doodle,
  wrapDoodleId,
}: {
  line: { id: string; text: string; price: string; poolId?: string };
  index: number;
  count: number;
  editable: ReceiptEditable;
  doodle?: ResolvedDoodle | null;
  wrapDoodleId: string | null;
}) {
  const active = editable.activeLineId === line.id;

  // The on-paper editor shows an ASTERISK-FREE draft; the marked phrases are
  // remembered so they can be re-applied by content on every keystroke (the
  // stored line.text keeps its `*markers*`, the input never shows them).
  const [draft, setDraft] = useState(() => stripMarkers(line.text));
  const [markedPhrases, setMarkedPhrases] = useState<string[]>(() =>
    extractMarkedPhrases(line.text),
  );
  // Seed only when this row becomes the active editor (or the row id changes) —
  // NOT on line.text, so re-applying markers mid-edit doesn't reset the draft.
  useEffect(() => {
    if (active) {
      setDraft(stripMarkers(line.text));
      setMarkedPhrases(extractMarkedPhrases(line.text));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, line.id]);

  if (!active) {
    // Shares ItemRowBody with the printed ItemRow so the editor preview matches
    // the print exactly (three-column QTY | ITEM | PRICE, whole-word wrapping).
    return (
      <button
        type="button"
        onClick={() => editable.onActivateLine(line.id)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.7em',
          width: '100%',
          fontFamily: MONO_FONT,
          fontSize: ITEM_LINE_FONT_SIZE,
          lineHeight: 1.5,
          color: INK,
          textTransform: 'uppercase',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px dashed ${EDIT_HINT}`,
          cursor: 'pointer',
          padding: '7px 0',
        }}
      >
        <ItemRowBody
          text={line.text}
          price={line.price}
          index={index}
          wrapDoodleId={wrapDoodleId}
          doodle={doodle}
        />
      </button>
    );
  }

  const editInput: CSSProperties = {
    fontFamily: MONO_FONT,
    fontSize: 16, // ≥16 avoids iOS focus-zoom
    color: INK,
    background: EDIT_BG,
    border: 'none',
    borderBottom: `1.5px solid ${EDIT_ACCENT}`,
    outline: 'none',
    padding: '6px 6px',
  };

  return (
    <div style={{ padding: '7px 0', borderBottom: `1px dashed ${EDIT_HINT}` }}>
      <input
        autoFocus
        value={draft}
        maxLength={NEW_LINE_MAX}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          // re-apply remembered markers by content; edited-away phrases drop out.
          editable.onChangeLine(
            line.id,
            'text',
            applyMarkers(next, markedPhrases),
          );
        }}
        placeholder="what you adore…"
        style={{ ...editInput, width: '100%' }}
      />
      <div
        style={{
          display: 'flex',
          gap: 5,
          alignItems: 'center',
          marginTop: 6,
        }}
      >
        <input
          value={line.price}
          maxLength={PRICE_MAX}
          onChange={(e) =>
            editable.onChangeLine(line.id, 'price', e.target.value)
          }
          placeholder="₹ / priceless"
          style={{ ...editInput, flex: 1, minWidth: 0, textAlign: 'right' }}
        />
        <CtrlBtn
          label="↑"
          disabled={index === 0}
          onClick={() => editable.onMoveLine(line.id, -1)}
        />
        <CtrlBtn
          label="↓"
          disabled={index === count - 1}
          onClick={() => editable.onMoveLine(line.id, 1)}
        />
        <CtrlBtn
          label="✕"
          tone="danger"
          onClick={() => editable.onDeleteLine(line.id)}
        />
        <CtrlBtn
          label="✓"
          tone="primary"
          onClick={() => editable.onActivateLine(null)}
        />
      </div>
    </div>
  );
}

function CtrlBtn({
  label,
  onClick,
  disabled,
  tone = 'plain',
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'plain' | 'danger' | 'primary';
}) {
  const palette: Record<string, CSSProperties> = {
    plain: { background: '#fff', color: INK, borderColor: EDIT_HINT },
    danger: {
      background: '#fff',
      color: EDIT_ACCENT,
      borderColor: EDIT_ACCENT,
    },
    primary: {
      background: EDIT_ACCENT,
      color: '#fff',
      borderColor: EDIT_ACCENT,
    },
  };
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        flexShrink: 0,
        fontFamily: MONO_FONT,
        fontSize: 15,
        lineHeight: 1,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 4,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        ...palette[tone],
      }}
    >
      {label}
    </button>
  );
}

// ── summary row: uppercase mono label left / value right ───────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.8em',
        fontFamily: MONO_FONT,
        fontSize: 12,
        lineHeight: 1.5,
        color: INK,
        textTransform: 'uppercase',
        padding: '1px 0',
      }}
    >
      <span style={{ flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere' }}>
        {label}
      </span>
      <span
        style={{
          flex: '0 0 auto',
          maxWidth: '48%',
          textAlign: 'right',
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── TOTAL row: larger bold mono, label left / value right ──────────────
function TotalRow({
  total,
  paidVia,
  editable,
}: {
  total: string;
  paidVia: string;
  editable?: ReceiptEditable;
}) {
  const valueStyle: CSSProperties = {
    fontFamily: MONO_FONT,
    fontSize: 16,
    fontWeight: 700,
    color: INK,
    textTransform: 'uppercase',
    textAlign: 'right',
  };

  let valueNode: React.ReactNode;
  if (editable) {
    valueNode = editable.editingTotal ? (
      <input
        autoFocus
        value={total}
        maxLength={48}
        onChange={(e) => editable.onChangeTotal(e.target.value)}
        onBlur={() => editable.onActivateTotal(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') editable.onActivateTotal(false);
        }}
        style={{
          ...valueStyle,
          width: '100%',
          minWidth: 0,
          background: EDIT_BG,
          border: 'none',
          borderBottom: `1.5px solid ${EDIT_ACCENT}`,
          outline: 'none',
          padding: '2px 4px',
        }}
      />
    ) : (
      <button
        type="button"
        onClick={() => editable.onActivateTotal(true)}
        style={{
          ...valueStyle,
          background: 'transparent',
          border: 'none',
          borderBottom: `1px dashed ${EDIT_HINT}`,
          cursor: 'pointer',
          padding: '1px 0',
        }}
      >
        {total}
      </button>
    );
  } else {
    valueNode = <span style={valueStyle}>{total}</span>;
  }

  return (
    <div style={{ padding: '2px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.8em',
          fontFamily: MONO_FONT,
          fontWeight: 700,
          fontSize: 16,
          color: INK,
          textTransform: 'uppercase',
        }}
      >
        <span style={{ flex: '1 1 auto', minWidth: 0 }}>Total</span>
        <span style={{ flex: '0 0 auto', minWidth: 0, maxWidth: '62%' }}>
          {valueNode}
        </span>
      </div>
      {paidVia ? (
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            color: INK_SOFT,
            marginTop: 8,
          }}
        >
          PAID VIA: {paidVia}
        </div>
      ) : null}
    </div>
  );
}

// ── fine print — left-aligned mono "card block" (CARD #/AUTH CODE feel) ──
function FinePrint({ payload }: { payload: ReceiptPayload }) {
  const lines = [payload.finePrint, payload.returnPolicy].filter(Boolean);
  if (!lines.length) return null;
  const lineStyle: CSSProperties = {
    fontFamily: MONO_FONT,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: INK_SOFT,
    textAlign: 'left',
    padding: '1px 0',
  };
  return (
    <>
      {lines.map((text, i) => (
        <div key={i} style={lineStyle}>
          {text}
        </div>
      ))}
    </>
  );
}

// ── centered THANK YOU footer ──────────────────────────────────────────
function Footer({ payload }: { payload: ReceiptPayload }) {
  if (!payload.footer) return null;
  return (
    <div
      style={{
        fontFamily: MONO_FONT,
        fontSize: 11,
        letterSpacing: '0.5px',
        lineHeight: 1.5,
        textTransform: 'uppercase',
        color: INK,
        textAlign: 'center',
        marginTop: 8,
        padding: '0 2px',
      }}
    >
      {payload.footer}
    </div>
  );
}

// ── barcode that spells ILOVEYOU (caption is a cheeky "scan = …" line) ──
function Barcode({ scanLine }: { scanLine: string }) {
  // Deterministic bar widths derived from the letters of ILOVEYOU so it looks
  // like a real Code-39-ish barcode but always encodes the same "message".
  const bars: { w: number; gap: number }[] = [];
  for (let i = 0; i < BARCODE_TEXT.length; i++) {
    const c = BARCODE_TEXT.charCodeAt(i);
    // 4 bars per character, widths cycling 1–3px from the char code
    for (let b = 0; b < 4; b++) {
      const w = ((c + b * 7) % 3) + 1;
      const gap = ((c + b * 3) % 2) + 1;
      bars.push({ w, gap });
    }
  }
  return (
    <div style={{ textAlign: 'center', marginTop: 12 }}>
      <div
        aria-hidden
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 0,
          height: 46,
        }}
      >
        {bars.map((bar, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: bar.w,
              height: 46,
              background: INK,
              marginRight: bar.gap,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 11,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: INK_SOFT,
          textAlign: 'center',
          marginTop: 6,
        }}
      >
        {scanLine}
      </div>
    </div>
  );
}
