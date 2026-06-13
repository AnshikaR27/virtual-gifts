'use client';

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import {
  BARCODE_TEXT,
  NEW_LINE_MAX,
  PRICE_MAX,
  type ReceiptPayload,
} from './lines';

/**
 * <ReceiptPaper> — the crumpled thermal-slip receipt, shared by the sender's
 * builder and the recipient's printing animation.
 *
 * Restyled to the Receiptify look: bright white paper, pure-black ink, a very
 * heavy uppercase grotesque header (DELULU MART), an all-monospace body, dashed
 * section rules, a numbered item table (01 / ITEM / PRICE) with right-aligned
 * prices, a bold TOTAL, a left-aligned card block (PAID VIA + fine print), a
 * centered THANK YOU footer and the ILOVEYOU barcode. The slanted rubber meme
 * stamp sits on top, re-tuned to read on white.
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

// Very heavy uppercase grotesque for the store header ("RECEIPTIFY" treatment).
const HEADER_FONT =
  "var(--font-archivo-black), 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Everything else is monospace (the Receiptify body look).
const MONO_FONT =
  "var(--font-space-mono), ui-monospace, 'IBM Plex Mono', 'Courier New', Courier, monospace";

// Faint paper grain (low-opacity fractal noise) under the ink.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

// Procedural crumpled-paper: a fractal-noise height map lit from the upper-left
// (feDiffuseLighting) so multi-directional wrinkles cast soft shadows in their
// creases. Multiply-blended at low opacity over white paper so the creases read
// as soft gray shadows. Tune `baseFrequency` for wrinkle size (lower = bigger
// folds) and `surfaceScale` for crease depth.
// NOTE: if iOS Safari renders this filter poorly/janky, swap for a crumpled-
// paper PNG + multiply (same overlay div, just backgroundImage: url(png)).
const CRUMPLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='620'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.014' numOctaves='5' seed='8' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23ffffff' surfaceScale='2' diffuseConstant='1' result='light'%3E%3CfeDistantLight azimuth='235' elevation='58'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)'/%3E%3C/svg%3E\")";

// Distress/grunge alpha-mask so the rubber stamp prints patchy & bled, never a
// clean solid shape. feTurbulence → alpha; discrete A punches transparent holes.
const GRUNGE_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05 0.08' numOctaves='4' seed='11' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0.5 0.5 0 0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0 0 1 1 1 1 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

// ── shared item-table columns (qty / item / price) ─────────────────────
// One geometry for the column header, plain item rows, and the editable rows so
// the numbers, titles and prices line up. Item text wraps inside its own column
// (already inset past the qty column); the price stays top-aligned on the right.
const QTY_COL: CSSProperties = { flex: '0 0 auto', width: '2.2em' };
const ITEM_COL: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowWrap: 'anywhere',
};
const PRICE_COL: CSSProperties = {
  flex: '0 0 auto',
  maxWidth: '40%',
  paddingLeft: '0.6em',
  textAlign: 'right',
  overflowWrap: 'anywhere',
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
    { kind: 'header' },
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
  /** Slam the meme stamp down once the receipt is printed. */
  showStamp?: boolean;
  /** Turn the receipt into its own editor (sender builder). */
  editable?: ReceiptEditable;
  style?: CSSProperties;
}

export function ReceiptPaper({
  payload,
  printedCount,
  animate = false,
  showStamp = false,
  editable,
  style,
}: ReceiptPaperProps) {
  const seq = buildSequence(payload, { showEmptyHint: !!editable });
  const shown = printedCount ?? seq.length;

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
        {/* Crumple overlay (multiply): currently a procedural lit fractal-noise
            SVG filter. To match the Receiptify reference, swap `backgroundImage`
            for a real crumpled-paper PNG: drop it at
            public/textures/crumpled-paper.png and set
            backgroundImage: "url('/textures/crumpled-paper.png')" here. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: CRUMPLE,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'multiply',
            opacity: 0.5,
          }}
        />

        <div style={{ position: 'relative' }}>
          {seq.slice(0, shown).map((row, i) => (
            <Row key={i} animate={animate}>
              {renderRow(row, payload, editable)}
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

function renderRow(
  row: SeqRow,
  payload: ReceiptPayload,
  editable?: ReceiptEditable,
): React.ReactNode {
  switch (row.kind) {
    case 'header':
      return <Header payload={payload} editable={editable} />;
    case 'rule':
      return <Rule />;
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
      const body = editable ? (
        <EditableItem
          line={line}
          index={row.lineIndex!}
          count={payload.lines.length}
          editable={editable}
        />
      ) : (
        <ItemRow text={line.text} price={line.price} index={row.lineIndex!} />
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
      return <Footer payload={payload} />;
    case 'barcode':
      return <Barcode scanLine={payload.scanLine} />;
    default:
      return null;
  }
}

// ── pieces ─────────────────────────────────────────────────────────────
function Header({
  payload,
  editable,
}: {
  payload: ReceiptPayload;
  editable?: ReceiptEditable;
}) {
  // The big black "RECEIPTIFY" treatment: heavy uppercase grotesque, large,
  // tight tracking, pure black — the heaviest thing on the page.
  const storeStyle: CSSProperties = {
    fontFamily: HEADER_FONT,
    fontWeight: 900,
    fontSize: 30,
    lineHeight: 1.02,
    letterSpacing: '-0.5px',
    textTransform: 'uppercase',
    color: INK,
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: 6 }}>
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

function Rule() {
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

// ── numbered item row: 01  ITEM (wraps under itself)  PRICE (right) ────
function ItemRow({
  text,
  price,
  index,
}: {
  text: string;
  price: string;
  index: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.7em',
        fontFamily: MONO_FONT,
        fontSize: 12.5,
        lineHeight: 1.5,
        color: INK,
        textTransform: 'uppercase',
        padding: '2px 0',
      }}
    >
      <span style={QTY_COL}>{String(index + 1).padStart(2, '0')}</span>
      <span style={ITEM_COL}>{text}</span>
      <span style={PRICE_COL}>{price}</span>
    </div>
  );
}

// ── editable line: tap to expand into an inline editor on the paper ─────
function EditableItem({
  line,
  index,
  count,
  editable,
}: {
  line: { id: string; text: string; price: string };
  index: number;
  count: number;
  editable: ReceiptEditable;
}) {
  const active = editable.activeLineId === line.id;

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => editable.onActivateLine(line.id)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.7em',
          width: '100%',
          fontFamily: MONO_FONT,
          fontSize: 12.5,
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
        <span style={QTY_COL}>{String(index + 1).padStart(2, '0')}</span>
        <span style={ITEM_COL}>{line.text}</span>
        <span style={PRICE_COL}>{line.price}</span>
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
        value={line.text}
        maxLength={NEW_LINE_MAX}
        onChange={(e) => editable.onChangeLine(line.id, 'text', e.target.value)}
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

// ── rubber meme-stamp ──────────────────────────────────────────────────
// Authentic stamped look: faded red ink, double-ruled rounded seal, rotated,
// and a grunge alpha-mask so the ink is patchy/bled — stamped, not printed.
// Slammed top-right over the meta block (Cashier / Billed-to / Bill# / GSTIN)
// as a classic angled corner stamp, kept low-opacity so the meta lines stay
// readable. Anchored from the top so it covers the same fixed band no matter
// how many item rows print — its bottom edge clears the QTY/ITEM/PRICE header
// so it never lands on a line-item confession.
// Re-tuned to a punchier red so it reads on the white paper.
const STAMP_INK = '#c1121f';

function Stamp({ text, show }: { text: string; show: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 2.2, rotate: -12 }}
      animate={
        show
          ? { opacity: 0.6, scale: 1, rotate: -12 }
          : { opacity: 0, scale: 2.2, rotate: -12 }
      }
      transition={{ type: 'spring', stiffness: 280, damping: 15 }}
      style={{
        // Top-right corner stamp over the meta block. top ~126 sits over the
        // Cashier/Billed-to/Bill#/GSTIN lines; its rotated bottom edge stays
        // above the QTY/ITEM/PRICE header, so it never touches an item row.
        position: 'absolute',
        top: 126,
        right: 16,
        zIndex: 6,
        pointerEvents: 'none',
        color: STAMP_INK,
        mixBlendMode: 'multiply',
        // grunge mask → patchy, bled ink instead of a clean shape
        WebkitMaskImage: GRUNGE_MASK,
        maskImage: GRUNGE_MASK,
        WebkitMaskSize: 'cover',
        maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          // double-ruled "official seal" border
          border: `4px double ${STAMP_INK}`,
          borderRadius: 10,
          padding: '6px 14px',
          maxWidth: 200,
          fontFamily: HEADER_FONT,
          fontWeight: 900,
          fontSize: 18,
          lineHeight: 1.04,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textAlign: 'center',
          boxShadow: `inset 0 0 0 1px ${STAMP_INK}`,
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}
