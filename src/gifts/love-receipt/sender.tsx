'use client';

import { useMemo, useReducer, useState } from 'react';
import { Window } from '@/components/ui/window';
import { WinButton } from '@/components/ui/win-button';
import { WinInput, WinLabel } from '@/components/ui/win-input';
import { WinSelect } from '@/components/ui/win-select';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { playClick } from '@/components/retro-sounds';
import { buildWaUrl } from '@/lib/whatsapp';
import { ReceiptPaper, type ReceiptEditable } from './receipt-paper';
import { createLoveReceipt } from './actions';
import { generateReceipt } from './generate';
import {
  buildScaffold,
  DEFAULT_PRICE,
  DEFAULT_STARTING_IDS,
  formatReceiptDate,
  getStartingLines,
  NEW_LINE_MAX,
  PERSONAL_QUESTIONS,
  PRICE_MAX,
  sampleBalanced,
  type ReceiptLine,
  type ReceiptPayload,
} from './lines';

const RELATIONSHIP_OPTIONS = [
  'girlfriend',
  'boyfriend',
  'partner',
  'crush',
  'situationship',
  'bestie',
  'husband',
  'wife',
];

let idCounter = 0;
const newId = () => `l${Date.now().toString(36)}${idCounter++}`;

// The single locked frame (DELULU MART). Static, but every field stays editable.
const FRAME = buildScaffold();

// ── overrides for the locked frame (user edits only) ────────────────────
interface FineOverrides {
  storeName?: string;
  subtitle?: string;
  cashier?: string;
  billNumber?: string;
  gstin?: string;
  subtotalPrice?: string;
  discountLabel?: string;
  discountPrice?: string;
  taxLabel?: string;
  taxPrice?: string;
  paidVia?: string;
  finePrint?: string;
  returnPolicy?: string;
  scanLine?: string;
  footer?: string;
}

interface State {
  step: 1 | 2;
  recipientName: string;
  senderName: string;
  relationship: string;
  answers: Record<string, string>;
  lines: ReceiptLine[];
  total: string;
  memeStamp: string | null;
  fine: FineOverrides;
  draftText: string;
  draftPrice: string;
}

type Action =
  | { type: 'set'; field: 'recipientName' | 'senderName'; value: string }
  | { type: 'setRelationship'; value: string }
  | { type: 'setAnswer'; key: string; value: string }
  | { type: 'setTotal'; value: string }
  | { type: 'setStamp'; value: string | null }
  | { type: 'setFine'; field: keyof FineOverrides; value: string }
  | { type: 'applyLines'; lines: { text: string; price: string }[] }
  | { type: 'addLine'; text: string; price: string }
  | { type: 'updateLine'; id: string; field: 'text' | 'price'; value: string }
  | { type: 'removeLine'; id: string }
  | { type: 'moveLine'; id: string; dir: -1 | 1 }
  | { type: 'setDraft'; field: 'draftText' | 'draftPrice'; value: string }
  | { type: 'step'; step: State['step'] };

// Balanced starting-4 render immediately on load — no empty state.
const initialState: State = {
  step: 1,
  recipientName: '',
  senderName: '',
  relationship: RELATIONSHIP_OPTIONS[0],
  answers: {},
  lines: getStartingLines().map((l) => ({
    id: newId(),
    text: l.text,
    price: l.price,
  })),
  total: FRAME.total,
  memeStamp: FRAME.stamp,
  fine: {},
  draftText: '',
  draftPrice: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setRelationship':
      return { ...state, relationship: action.value };
    case 'setAnswer':
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value },
      };
    case 'setTotal':
      return { ...state, total: action.value };
    case 'setStamp':
      return { ...state, memeStamp: action.value };
    case 'setFine':
      return {
        ...state,
        fine: { ...state.fine, [action.field]: action.value },
      };
    case 'applyLines':
      return {
        ...state,
        lines: action.lines.map((l) => ({
          id: newId(),
          text: l.text,
          price: l.price.trim() || DEFAULT_PRICE,
        })),
      };
    case 'addLine':
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            id: newId(),
            text: action.text,
            price: action.price.trim() || DEFAULT_PRICE,
          },
        ],
      };
    case 'updateLine':
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.id === action.id ? { ...l, [action.field]: action.value } : l,
        ),
      };
    case 'removeLine':
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
    case 'moveLine': {
      const idx = state.lines.findIndex((l) => l.id === action.id);
      const swap = idx + action.dir;
      if (idx < 0 || swap < 0 || swap >= state.lines.length) return state;
      const lines = [...state.lines];
      [lines[idx], lines[swap]] = [lines[swap], lines[idx]];
      return { ...state, lines };
    }
    case 'setDraft':
      return { ...state, [action.field]: action.value };
    case 'step':
      return { ...state, step: action.step };
    default:
      return state;
  }
}

/** Assemble the effective payload from state (overrides win over the frame). */
function buildPayload(state: State): ReceiptPayload {
  const { fine } = state;
  const frame = buildScaffold();
  return {
    version: 1,
    language: 'en', // REVISIT: Hinglish later as a data drop, not a refactor
    recipientName: state.recipientName.trim() || 'you',
    senderName: state.senderName.trim(),
    relationship: state.relationship,
    storeName: fine.storeName ?? frame.storeName,
    subtitle: fine.subtitle ?? frame.subtitle,
    receiptLabel: frame.receiptLabel,
    dateLabel: formatReceiptDate(),
    cashier: fine.cashier ?? frame.cashier,
    billNumber: fine.billNumber ?? frame.billNumber,
    gstin: fine.gstin ?? frame.gstin,
    lines: state.lines,
    subtotal: {
      label: frame.subtotal.label,
      price: fine.subtotalPrice ?? frame.subtotal.price,
    },
    discount: {
      label: fine.discountLabel ?? frame.discount.label,
      price: fine.discountPrice ?? frame.discount.price,
    },
    tax: {
      label: fine.taxLabel ?? frame.tax.label,
      price: fine.taxPrice ?? frame.tax.price,
    },
    total: state.total.trim() || frame.total,
    paidVia: fine.paidVia ?? frame.paidVia,
    finePrint: fine.finePrint ?? frame.finePrint,
    returnPolicy: fine.returnPolicy ?? frame.returnPolicy,
    scanLine: fine.scanLine ?? frame.scanLine,
    footer: fine.footer ?? frame.footer,
    memeStamp: state.memeStamp,
  };
}

export function LoveReceiptSender() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fineOpen, setFineOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genSource, setGenSource] = useState<'ai' | 'fallback' | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  // Balanced-shuffle bookkeeping: pool ids already shown (so regenerate stays
  // fresh) + the tone cursor (so tones rotate across consecutive draws).
  const [shownIds, setShownIds] = useState<Set<string>>(
    () => new Set(DEFAULT_STARTING_IDS),
  );
  const [toneCursor, setToneCursor] = useState(0);

  // edit-on-receipt UI state (which cell is being edited)
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState(false);
  const [editingTotal, setEditingTotal] = useState(false);

  const payload = useMemo(() => buildPayload(state), [state]);

  const goto = (step: State['step']) => {
    playClick();
    dispatch({ type: 'step', step });
  };

  const canContinueStep1 = state.recipientName.trim().length > 0;
  const canSend = state.lines.length > 0;

  // ── edit-on-receipt handlers (one editor open at a time) ──
  const editable: ReceiptEditable = {
    activeLineId,
    onActivateLine: (id) => {
      if (id !== null) playClick();
      setEditingStore(false);
      setEditingTotal(false);
      setActiveLineId(id);
    },
    editingStore,
    onActivateStore: (editing) => {
      if (editing) {
        playClick();
        setActiveLineId(null);
        setEditingTotal(false);
      }
      setEditingStore(editing);
    },
    editingTotal,
    onActivateTotal: (editing) => {
      if (editing) {
        playClick();
        setActiveLineId(null);
        setEditingStore(false);
      }
      setEditingTotal(editing);
    },
    onChangeStore: (value) =>
      dispatch({ type: 'setFine', field: 'storeName', value }),
    onChangeTotal: (value) => dispatch({ type: 'setTotal', value }),
    onChangeLine: (id, field, value) =>
      dispatch({ type: 'updateLine', id, field, value }),
    onDeleteLine: (id) => {
      playClick();
      dispatch({ type: 'removeLine', id });
      if (activeLineId === id) setActiveLineId(null);
    },
    onMoveLine: (id, dir) => {
      playClick();
      dispatch({ type: 'moveLine', id, dir });
    },
    emptyHint: 'tap ✨ Generate for a fresh set of lines',
  };

  const hasPersonalAnswers = Object.values(state.answers).some(
    (v) => v.trim().length > 0,
  );

  // AI generate (used when the sender added personal details, or 🌶️ Cringier).
  // Only the line items vary — the locked frame is applied in buildPayload.
  const generate = async (spice: 'normal' | 'extra') => {
    if (generating) return;
    playClick();
    setGenerating(true);
    setError(null);
    try {
      const { receipt, source } = await generateReceipt({
        recipientName: state.recipientName,
        senderName: state.senderName,
        relationship: state.relationship,
        language: 'en',
        answers: state.answers,
        spice,
      });
      dispatch({ type: 'applyLines', lines: receipt.lines });
      setGenSource(source);
      setHasGenerated(true);
    } catch {
      setGenSource('fallback');
    } finally {
      setGenerating(false);
    }
  };

  // Instant, offline-safe balanced draw of 4 from the single pool.
  const drawPool = () => {
    playClick();
    const draw = sampleBalanced(shownIds, toneCursor);
    dispatch({ type: 'applyLines', lines: draw.lines });
    setShownIds(draw.shownIds);
    setToneCursor(draw.toneCursor);
    setGenSource(null); // pool is the intended default, not an error fallback
    setHasGenerated(true);
  };

  const regenerate = () =>
    hasPersonalAnswers ? generate('normal') : drawPool();

  const addDraft = () => {
    const text = state.draftText.trim();
    if (!text) return;
    playClick();
    dispatch({ type: 'addLine', text, price: state.draftPrice });
    dispatch({ type: 'setDraft', field: 'draftText', value: '' });
    dispatch({ type: 'setDraft', field: 'draftPrice', value: '' });
  };

  const handleSend = async () => {
    if (pending) return;
    playClick();
    setPending(true);
    setError(null);
    try {
      const { shortId } = await createLoveReceipt(buildPayload(state));
      window.location.href = buildWaUrl({
        recipientName: state.recipientName.trim(),
        shortId,
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not send. Please try again.',
      );
      setPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[380px]">
      <Window title={<span className="font-pixel">🧾 RECEIPT.exe</span>}>
        <MultiStepForm step={state.step}>
          {/* ── Step 1 — who's it for ── */}
          <div>
            <Headline
              title="Open their Heart Mart 🧾"
              subtitle="Every receipt needs a customer. Tell us who's checking out."
            />
            <WinInput
              label="Made out to:"
              value={state.recipientName}
              onChange={(e) =>
                dispatch({
                  type: 'set',
                  field: 'recipientName',
                  value: e.target.value,
                })
              }
              placeholder="Their name"
              maxLength={40}
            />
            <WinSelect
              label="They're your:"
              value={state.relationship}
              onChange={(v) => dispatch({ type: 'setRelationship', value: v })}
              options={[...RELATIONSHIP_OPTIONS]}
            />
            <WinInput
              label="From (you):"
              value={state.senderName}
              onChange={(e) =>
                dispatch({
                  type: 'set',
                  field: 'senderName',
                  value: e.target.value,
                })
              }
              placeholder="Your name"
              maxLength={40}
            />
            <NavRow>
              <WinButton variant="grey" disabled>
                ◀ Back
              </WinButton>
              <WinButton
                variant="pink"
                onClick={() => goto(2)}
                disabled={!canContinueStep1}
                style={canContinueStep1 ? undefined : { opacity: 0.6 }}
              >
                Build receipt ▶
              </WinButton>
            </NavRow>
          </div>

          {/* ── Step 2 — build on the receipt ── */}
          {/* Normal-flow column that scrolls; Send lives in a sticky footer
              below so it's always reachable however long the receipt grows. */}
          <div style={{ paddingBottom: 8 }}>
            {/* live receipt = the editor (scrolls with the page) */}
            <div
              style={{
                margin: '-14px -14px 14px',
                padding: '16px 10px',
                background:
                  'repeating-linear-gradient(45deg, #c4b6dc, #c4b6dc 10px, #bcaed4 10px, #bcaed4 20px)',
                borderBottom: '2px solid var(--win-chrome-dark)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ReceiptPaper payload={payload} editable={editable} showStamp />
              </div>
            </div>

            <p
              className="font-body"
              style={{
                fontSize: 12,
                color: 'rgba(26,10,46,0.6)',
                lineHeight: 1.4,
                margin: '12px 0 12px',
              }}
            >
              ✎ Tap the <strong>store name</strong>, any <strong>line</strong>,
              or the <strong>total</strong> to edit. Shuffle in fresh lines
              below 👇
            </p>

            {/* make it personal (optional) */}
            <button
              type="button"
              onClick={() => {
                playClick();
                setPersonalOpen((o) => !o);
              }}
              className="font-pixel"
              style={disclosureStyle(personalOpen)}
            >
              {personalOpen ? '▼' : '▶'} make it personal 💕 (optional)
            </button>
            {personalOpen ? (
              <div style={{ marginBottom: 12 }}>
                {PERSONAL_QUESTIONS.map((q) => (
                  <FineInput
                    key={q.key}
                    label={q.label}
                    value={state.answers[q.key] ?? ''}
                    placeholder={q.placeholder}
                    onChange={(v) =>
                      dispatch({ type: 'setAnswer', key: q.key, value: v })
                    }
                  />
                ))}
              </div>
            ) : null}

            {/* generate */}
            <WinButton
              variant="pink"
              onClick={() =>
                hasPersonalAnswers ? generate('normal') : drawPool()
              }
              disabled={generating}
              style={{ width: '100%', marginBottom: 8 }}
            >
              {generating
                ? 'Generating…'
                : hasGenerated
                  ? '✨ Generate again'
                  : '✨ Generate my receipt'}
            </WinButton>
            {hasGenerated ? (
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <WinButton
                  variant="grey"
                  onClick={regenerate}
                  disabled={generating}
                  style={{ flex: 1 }}
                >
                  🔁 Regenerate
                </WinButton>
                <WinButton
                  variant="grey"
                  onClick={() => generate('extra')}
                  disabled={generating}
                  style={{ flex: 1 }}
                >
                  🌶️ Cringier
                </WinButton>
              </div>
            ) : null}
            {genSource === 'fallback' && hasGenerated ? (
              <p
                className="font-body"
                style={{
                  fontSize: 11,
                  color: 'rgba(26,10,46,0.5)',
                  fontStyle: 'italic',
                  marginBottom: 12,
                }}
              >
                ✨ used a starter set — tap a line to tweak, or generate again.
              </p>
            ) : (
              <div style={{ marginBottom: 12 }} />
            )}

            {/* manual add line */}
            <WinLabel>+ Add your own line</WinLabel>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <input
                value={state.draftText}
                onChange={(e) =>
                  dispatch({
                    type: 'setDraft',
                    field: 'draftText',
                    value: e.target.value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDraft();
                  }
                }}
                placeholder="What you adore…"
                maxLength={NEW_LINE_MAX}
                className="font-body text-ink"
                style={{ ...fieldStyle, flex: 2 }}
              />
              <input
                value={state.draftPrice}
                onChange={(e) =>
                  dispatch({
                    type: 'setDraft',
                    field: 'draftPrice',
                    value: e.target.value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDraft();
                  }
                }}
                placeholder="₹ / copium"
                maxLength={PRICE_MAX}
                className="font-body text-ink"
                style={{ ...fieldStyle, flex: 1, minWidth: 0 }}
              />
            </div>
            <WinButton
              variant="grey"
              onClick={addDraft}
              disabled={!state.draftText.trim()}
              style={{ width: '100%', marginBottom: 14 }}
            >
              + Add line
            </WinButton>

            {/* fine print (collapsible) — every frame field stays editable */}
            <button
              type="button"
              onClick={() => {
                playClick();
                setFineOpen((o) => !o);
              }}
              className="font-pixel"
              style={disclosureStyle(fineOpen)}
            >
              {fineOpen ? '▼' : '▶'} ✎ Edit the fine print
            </button>
            {fineOpen ? (
              <div style={{ marginBottom: 14 }}>
                <FineInput
                  label="Subtitle"
                  value={state.fine.subtitle ?? FRAME.subtitle}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'subtitle', value: v })
                  }
                />
                <FineInput
                  label="Cashier"
                  value={state.fine.cashier ?? FRAME.cashier}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'cashier', value: v })
                  }
                />
                <FineInput
                  label="Bill #"
                  value={state.fine.billNumber ?? FRAME.billNumber}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'billNumber', value: v })
                  }
                />
                <FineInput
                  label="GSTIN"
                  value={state.fine.gstin ?? FRAME.gstin}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'gstin', value: v })
                  }
                />
                <FineInput
                  label="Subtotal value"
                  value={state.fine.subtotalPrice ?? FRAME.subtotal.price}
                  onChange={(v) =>
                    dispatch({
                      type: 'setFine',
                      field: 'subtotalPrice',
                      value: v,
                    })
                  }
                />
                <FineInput
                  label="Discount note"
                  value={state.fine.discountLabel ?? FRAME.discount.label}
                  onChange={(v) =>
                    dispatch({
                      type: 'setFine',
                      field: 'discountLabel',
                      value: v,
                    })
                  }
                />
                <FineInput
                  label="Tax note"
                  value={state.fine.taxLabel ?? FRAME.tax.label}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'taxLabel', value: v })
                  }
                />
                <FineInput
                  label="Paid via"
                  value={state.fine.paidVia ?? FRAME.paidVia}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'paidVia', value: v })
                  }
                />
                <FineInput
                  label="Fine print"
                  value={state.fine.finePrint ?? FRAME.finePrint}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'finePrint', value: v })
                  }
                  multiline
                />
                <FineInput
                  label="Return policy"
                  value={state.fine.returnPolicy ?? FRAME.returnPolicy}
                  onChange={(v) =>
                    dispatch({
                      type: 'setFine',
                      field: 'returnPolicy',
                      value: v,
                    })
                  }
                  multiline
                />
                <FineInput
                  label="Footer"
                  value={state.fine.footer ?? FRAME.footer}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'footer', value: v })
                  }
                />
                <FineInput
                  label="Stamp"
                  value={state.memeStamp ?? ''}
                  placeholder="(leave blank for no stamp)"
                  onChange={(v) =>
                    dispatch({
                      type: 'setStamp',
                      value: v.trim() ? v : null,
                    })
                  }
                />
              </div>
            ) : null}

            {error ? (
              <p
                className="font-pixel"
                style={{
                  fontSize: 12,
                  color: 'var(--win-magenta)',
                  marginTop: 8,
                }}
              >
                {error}
              </p>
            ) : null}

            {/* sticky footer — Send is always reachable, however tall the
                receipt gets. Opaque bg so content scrolls under it. */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 5,
                display: 'flex',
                gap: 8,
                margin: '12px -14px -16px',
                padding: '10px 14px calc(10px + env(safe-area-inset-bottom))',
                background: 'var(--win-chrome)',
                borderTop: '2px solid var(--win-chrome-light)',
                boxShadow: '0 -3px 8px rgba(26,10,46,0.2)',
              }}
            >
              <WinButton
                variant="grey"
                onClick={() => goto(1)}
                disabled={pending}
              >
                ◀ Back
              </WinButton>
              <WinButton
                variant="whatsapp"
                onClick={handleSend}
                disabled={pending || !canSend}
                style={!canSend && !pending ? { opacity: 0.6 } : undefined}
              >
                {pending ? 'Printing…' : 'Send receipt 💌'}
              </WinButton>
            </div>
          </div>
        </MultiStepForm>
      </Window>
    </div>
  );
}

// ── small building blocks ──────────────────────────────────────────────
const fieldStyle = {
  borderStyle: 'solid' as const,
  borderWidth: 2,
  borderTopColor: 'var(--win-chrome-dark)',
  borderLeftColor: 'var(--win-chrome-dark)',
  borderRightColor: 'var(--win-chrome-light)',
  borderBottomColor: 'var(--win-chrome-light)',
  background: '#fff',
  padding: '6px 8px',
  fontSize: 13,
  borderRadius: 0,
};

function disclosureStyle(open: boolean): React.CSSProperties {
  return {
    width: '100%',
    textAlign: 'left',
    background: '#e8e0ed',
    border: '2px solid var(--win-chrome-dark)',
    borderRightColor: 'var(--win-chrome-light)',
    borderBottomColor: 'var(--win-chrome-light)',
    padding: '6px 8px',
    fontSize: 12,
    cursor: 'pointer',
    marginBottom: open ? 8 : 12,
  };
}

function Headline({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h3
        className="font-display italic"
        style={{
          fontWeight: 700,
          fontSize: 22,
          lineHeight: 1.15,
          marginBottom: 4,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 12,
          color: 'rgba(26, 10, 46, 0.7)',
          lineHeight: 1.4,
          marginBottom: 14,
        }}
      >
        {subtitle}
      </p>
    </>
  );
}

function NavRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex gap-2">{children}</div>;
}

function FineInput({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="mb-2.5 w-full">
      <WinLabel>{label}</WinLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="font-body text-ink"
          style={{ ...fieldStyle, width: '100%', resize: 'none' }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="font-body text-ink"
          style={{ ...fieldStyle, width: '100%' }}
        />
      )}
    </div>
  );
}
