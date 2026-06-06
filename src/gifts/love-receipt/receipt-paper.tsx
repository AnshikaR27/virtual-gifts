'use client';

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { BARCODE_TEXT, type ReceiptPayload } from './lines';

/**
 * <ReceiptPaper> — the realistic crumpled-paper receipt, shared by the sender's
 * live preview and the recipient's printing animation.
 *
 * Faithful to the reference photo: cream paper, torn top/bottom edges, a heavy
 * condensed header, a faded-charcoal monospace body, thin divider rules, a bold
 * TOTAL, and a "Thank you!" footer. Two playful extras sit on top: a slanted
 * rubber meme-stamp and a barcode that spells ILOVEYOU.
 *
 * The recipient feeds the paper out one row at a time via `printedCount`; the
 * sender preview passes the full count with `animate={false}` so edits don't
 * re-trigger the entrance animation on every keystroke.
 */

// ── ink + paper palette (faded thermal print, not pure black) ──────────
const INK = '#46423b';
const INK_SOFT = 'rgba(70, 66, 59, 0.62)';
const RULE = 'rgba(70, 66, 59, 0.5)';
const PAPER = '#f4efe3';

const HEADING_FONT =
  "var(--font-oswald), 'Arial Narrow', 'Helvetica Neue', Impact, sans-serif";
const MONO_FONT =
  "var(--font-jetbrains-mono), ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace";

// Faint paper grain (low-opacity fractal noise) for the crumpled texture.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

// Torn/uneven top + bottom edges via a jagged clip-path polygon.
const TORN_CLIP = [
  // top edge (left → right), small px jitter
  '0 6px',
  '9% 1px',
  '18% 5px',
  '27% 0px',
  '37% 4px',
  '47% 1px',
  '58% 5px',
  '68% 0px',
  '79% 4px',
  '90% 1px',
  '100% 5px',
  // bottom edge (right → left)
  '100% calc(100% - 6px)',
  '91% calc(100% - 1px)',
  '81% calc(100% - 5px)',
  '70% calc(100% - 0px)',
  '60% calc(100% - 4px)',
  '49% calc(100% - 1px)',
  '39% calc(100% - 5px)',
  '28% calc(100% - 0px)',
  '18% calc(100% - 4px)',
  '8% calc(100% - 1px)',
  '0 calc(100% - 5px)',
].join(', ');

// ── reveal sequence (shared shape for paper + printing pacing) ─────────
type RowKind =
  | 'header'
  | 'rule'
  | 'item'
  | 'summary'
  | 'total'
  | 'footer'
  | 'barcode';

interface SeqRow {
  kind: RowKind;
  /** index into payload.lines for item rows */
  lineIndex?: number;
  /** which summary row for summary kind */
  summary?: 'subtotal' | 'discount' | 'tax';
}

export function buildSequence(payload: ReceiptPayload): SeqRow[] {
  return [
    { kind: 'header' },
    { kind: 'rule' },
    ...payload.lines.map(
      (_, lineIndex): SeqRow => ({ kind: 'item', lineIndex }),
    ),
    { kind: 'rule' },
    { kind: 'summary', summary: 'subtotal' },
    { kind: 'summary', summary: 'discount' },
    { kind: 'summary', summary: 'tax' },
    { kind: 'rule' },
    { kind: 'total' },
    { kind: 'footer' },
    { kind: 'barcode' },
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
  /** Animate each row in as it appears (printing). Off for the live preview. */
  animate?: boolean;
  /** Slam the meme stamp down once the receipt is printed. */
  showStamp?: boolean;
  style?: CSSProperties;
}

export function ReceiptPaper({
  payload,
  printedCount,
  animate = false,
  showStamp = false,
  style,
}: ReceiptPaperProps) {
  const seq = buildSequence(payload);
  const shown = printedCount ?? seq.length;

  return (
    <div
      style={{
        position: 'relative',
        width: 'min(300px, 86vw)',
        filter: 'drop-shadow(0 14px 26px rgba(40, 30, 20, 0.32))',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          background: PAPER,
          backgroundImage: GRAIN,
          clipPath: `polygon(${TORN_CLIP})`,
          padding: '26px 20px 24px',
          color: INK,
          // soft crumple highlights + shadow streaks
          boxShadow:
            'inset 0 0 40px rgba(120, 100, 70, 0.12), inset 0 0 8px rgba(255,255,255,0.4)',
        }}
      >
        {/* crumple light/shadow streaks */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(120% 60% at 30% 0%, rgba(255,255,255,0.45), transparent 55%), radial-gradient(100% 50% at 85% 100%, rgba(120,100,70,0.12), transparent 60%), linear-gradient(115deg, transparent 40%, rgba(120,100,70,0.06) 50%, transparent 60%)',
            mixBlendMode: 'multiply',
          }}
        />

        <div style={{ position: 'relative' }}>
          {seq.slice(0, shown).map((row, i) => (
            <Row key={i} animate={animate}>
              {renderRow(row, payload)}
            </Row>
          ))}
        </div>

        {/* slanted rubber meme-stamp */}
        {payload.memeStamp ? (
          <Stamp text={payload.memeStamp} show={showStamp} />
        ) : null}
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

function renderRow(row: SeqRow, payload: ReceiptPayload): React.ReactNode {
  switch (row.kind) {
    case 'header':
      return <Header payload={payload} />;
    case 'rule':
      return <Rule />;
    case 'item': {
      const line = payload.lines[row.lineIndex!];
      return <ItemRow text={line.text} price={line.price} />;
    }
    case 'summary': {
      const r = payload[row.summary!];
      return <SummaryRow label={r.label} price={r.price} />;
    }
    case 'total':
      return <TotalRow total={payload.total} />;
    case 'footer':
      return <Footer payload={payload} />;
    case 'barcode':
      return <Barcode />;
    default:
      return null;
  }
}

// ── pieces ─────────────────────────────────────────────────────────────
function Header({ payload }: { payload: ReceiptPayload }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 6 }}>
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontWeight: 700,
          fontSize: 30,
          lineHeight: 1.02,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: INK,
        }}
      >
        {payload.storeName}
      </div>
      {payload.subtitle ? (
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 10.5,
            letterSpacing: '0.5px',
            color: INK_SOFT,
            marginTop: 5,
          }}
        >
          {payload.subtitle}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginTop: 12,
        }}
      >
        {payload.receiptLabel}
      </div>
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 10.5,
          color: INK_SOFT,
          textAlign: 'right',
          marginTop: 4,
        }}
      >
        {payload.dateLabel}
      </div>
    </div>
  );
}

function Rule() {
  return <div style={{ borderTop: `1px solid ${RULE}`, margin: '8px 0' }} />;
}

function ItemRow({ text, price }: { text: string; price: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        fontFamily: MONO_FONT,
        fontSize: 13,
        lineHeight: 1.45,
        color: INK,
        padding: '3px 0',
      }}
    >
      <span style={{ flex: 1 }}>{text}</span>
      <span style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{price}</span>
    </div>
  );
}

function SummaryRow({ label, price }: { label: string; price: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        fontFamily: MONO_FONT,
        fontSize: 12.5,
        lineHeight: 1.45,
        color: INK_SOFT,
        padding: '2px 0',
      }}
    >
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{price}</span>
    </div>
  );
}

function TotalRow({ total }: { total: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
        fontFamily: HEADING_FONT,
        fontWeight: 700,
        textTransform: 'uppercase',
        color: INK,
        padding: '2px 0',
      }}
    >
      <span style={{ fontSize: 21, letterSpacing: '1px' }}>Total</span>
      <span
        style={{
          fontSize: 18,
          textAlign: 'right',
          letterSpacing: '0.3px',
          textTransform: 'none',
          fontFamily: MONO_FONT,
          fontWeight: 700,
        }}
      >
        {total}
      </span>
    </div>
  );
}

function Footer({ payload }: { payload: ReceiptPayload }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 14 }}>
      <div
        style={{
          fontFamily: HEADING_FONT,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '0.5px',
        }}
      >
        Thank you!
      </div>
      {payload.footer ? (
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 10.5,
            lineHeight: 1.6,
            color: INK_SOFT,
            marginTop: 8,
            padding: '0 2px',
          }}
        >
          {payload.footer}
        </div>
      ) : null}
    </div>
  );
}

// ── barcode that spells ILOVEYOU ───────────────────────────────────────
function Barcode() {
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
    <div style={{ textAlign: 'center', marginTop: 16 }}>
      <div
        aria-hidden
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 0,
          height: 44,
        }}
      >
        {bars.map((bar, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: bar.w,
              height: 44,
              background: INK,
              marginRight: bar.gap,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 12,
          letterSpacing: '6px',
          color: INK,
          marginTop: 5,
          paddingLeft: 6,
        }}
      >
        {BARCODE_TEXT.split('').join(' ')}
      </div>
    </div>
  );
}

// ── rubber meme-stamp ──────────────────────────────────────────────────
function Stamp({ text, show }: { text: string; show: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 2.4, rotate: -14 }}
      animate={
        show
          ? { opacity: 0.78, scale: 1, rotate: -14 }
          : { opacity: 0, scale: 2.4, rotate: -14 }
      }
      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      style={{
        position: 'absolute',
        top: '58%',
        left: '50%',
        x: '-50%',
        y: '-50%',
        zIndex: 5,
        pointerEvents: 'none',
        fontFamily: HEADING_FONT,
        fontWeight: 700,
        fontSize: 21,
        lineHeight: 1.05,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        textAlign: 'center',
        color: '#b6303a',
        border: '3px solid #b6303a',
        borderRadius: 6,
        padding: '8px 14px',
        maxWidth: 200,
        mixBlendMode: 'multiply',
        boxShadow: 'inset 0 0 0 2px rgba(182,48,58,0.25)',
      }}
    >
      {text}
    </motion.div>
  );
}
