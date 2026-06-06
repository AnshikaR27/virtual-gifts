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
import {
  buildScaffold,
  DEFAULT_PRICE,
  formatReceiptDate,
  MEME_STAMPS,
  NEW_LINE_MAX,
  PRICE_MAX,
  resolveSeedText,
  SUGGESTIONS,
  TOTAL_OPTIONS,
  type ReceiptLanguage,
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

// ── overrides for the auto-filled scaffolding ──────────────────────────
// storeName lives here too (edited on the receipt); the rest are fine print.
interface FineOverrides {
  storeName?: string;
  subtitle?: string;
  subtotalPrice?: string;
  discountLabel?: string;
  taxLabel?: string;
  footer?: string;
}

interface State {
  step: 1 | 2;
  language: ReceiptLanguage;
  recipientName: string;
  senderName: string;
  relationship: string;
  lines: ReceiptLine[];
  total: string;
  memeStamp: string | null;
  fine: FineOverrides;
  draftText: string;
  draftPrice: string;
}

type Action =
  | { type: 'set'; field: 'recipientName' | 'senderName'; value: string }
  | { type: 'setLanguage'; value: ReceiptLanguage }
  | { type: 'setRelationship'; value: string }
  | { type: 'setTotal'; value: string }
  | { type: 'setStamp'; value: string | null }
  | { type: 'setFine'; field: keyof FineOverrides; value: string }
  | { type: 'addLine'; text: string; price: string }
  | { type: 'updateLine'; id: string; field: 'text' | 'price'; value: string }
  | { type: 'removeLine'; id: string }
  | { type: 'moveLine'; id: string; dir: -1 | 1 }
  | { type: 'setDraft'; field: 'draftText' | 'draftPrice'; value: string }
  | { type: 'step'; step: State['step'] };

const initialState: State = {
  step: 1,
  language: 'en',
  recipientName: '',
  senderName: '',
  relationship: RELATIONSHIP_OPTIONS[0],
  lines: [],
  total: TOTAL_OPTIONS[0],
  memeStamp: MEME_STAMPS[0],
  fine: {},
  draftText: '',
  draftPrice: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'setLanguage':
      return { ...state, language: action.value };
    case 'setRelationship':
      return { ...state, relationship: action.value };
    case 'setTotal':
      return { ...state, total: action.value };
    case 'setStamp':
      return { ...state, memeStamp: action.value };
    case 'setFine':
      return {
        ...state,
        fine: { ...state.fine, [action.field]: action.value },
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

/** Assemble the effective payload from state (overrides win over scaffold). */
function buildPayload(state: State): ReceiptPayload {
  const { fine } = state;
  const scaffold = buildScaffold(
    state.language,
    state.recipientName,
    state.senderName,
  );
  return {
    version: 1,
    language: state.language,
    recipientName: state.recipientName.trim() || 'you',
    senderName: state.senderName.trim(),
    relationship: state.relationship,
    storeName: fine.storeName ?? scaffold.storeName,
    subtitle: fine.subtitle ?? scaffold.subtitle,
    receiptLabel: scaffold.receiptLabel,
    dateLabel: formatReceiptDate(),
    lines: state.lines,
    subtotal: {
      label: scaffold.subtotal.label,
      price: fine.subtotalPrice ?? scaffold.subtotal.price,
    },
    discount: {
      label: fine.discountLabel ?? scaffold.discount.label,
      price: scaffold.discount.price,
    },
    tax: {
      label: fine.taxLabel ?? scaffold.tax.label,
      price: scaffold.tax.price,
    },
    total: state.total.trim() || TOTAL_OPTIONS[0],
    footer: fine.footer ?? scaffold.footer,
    memeStamp: state.memeStamp,
  };
}

export function LoveReceiptSender() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fineOpen, setFineOpen] = useState(false);

  // edit-on-receipt UI state (which cell is being edited)
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState(false);
  const [editingTotal, setEditingTotal] = useState(false);

  const payload = useMemo(() => buildPayload(state), [state]);
  const scaffold = useMemo(
    () => buildScaffold(state.language, state.recipientName, state.senderName),
    [state.language, state.recipientName, state.senderName],
  );

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
    emptyHint: 'tap a starter line below to add it ✨',
  };

  const addDraft = () => {
    const text = state.draftText.trim();
    if (!text) return;
    playClick();
    dispatch({ type: 'addLine', text, price: state.draftPrice });
    dispatch({ type: 'setDraft', field: 'draftText', value: '' });
    dispatch({ type: 'setDraft', field: 'draftPrice', value: '' });
  };

  const addSuggestion = (text: string, price: string) => {
    playClick();
    dispatch({ type: 'addLine', text, price });
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
            <LanguageToggle
              language={state.language}
              onChange={(v) => {
                playClick();
                dispatch({ type: 'setLanguage', value: v });
              }}
            />
            <WinInput
              label="Cashier (you):"
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
              {editingTotal ? (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <div
                    className="font-pixel"
                    style={{
                      fontSize: 11,
                      color: '#fff',
                      letterSpacing: '0.5px',
                      marginBottom: 4,
                      textShadow: '1px 1px 0 rgba(26,10,46,.4)',
                    }}
                  >
                    ✨ total ideas
                  </div>
                  {TOTAL_OPTIONS.map((opt) => (
                    <ChipButton
                      key={opt}
                      active={state.total === opt}
                      onClick={() => {
                        playClick();
                        dispatch({ type: 'setTotal', value: opt });
                      }}
                    >
                      {opt}
                    </ChipButton>
                  ))}
                </div>
              ) : null}
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
              or the <strong>total</strong> on the receipt to edit it. Add lines
              from below 👇
            </p>

            {/* suggestion library */}
            <WinLabel>Starter lines — tap to add</WinLabel>
            <div
              className="scrollbar-hide"
              style={{
                maxHeight: 160,
                overflowY: 'auto',
                border: '2px solid var(--win-chrome-dark)',
                borderRightColor: 'var(--win-chrome-light)',
                borderBottomColor: 'var(--win-chrome-light)',
                background: '#fff',
                padding: 4,
                marginBottom: 12,
              }}
            >
              {SUGGESTIONS[state.language].map((seed, i) => {
                const text = resolveSeedText(
                  seed,
                  state.recipientName,
                  state.senderName,
                );
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addSuggestion(text, seed.price)}
                    className="font-body"
                    style={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'space-between',
                      gap: 8,
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '8px 8px',
                      fontSize: 12.5,
                      color: 'var(--ink, #1a0a2e)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px dashed rgba(26,10,46,0.14)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ flex: 1 }}>{text}</span>
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        color: 'var(--win-magenta)',
                        fontSize: 11,
                      }}
                    >
                      {seed.price}
                    </span>
                    <span
                      style={{ color: 'var(--win-magenta)', fontWeight: 700 }}
                    >
                      +
                    </span>
                  </button>
                );
              })}
            </div>

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
                placeholder="₹ / priceless"
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

            {/* fine print (collapsible) */}
            <button
              type="button"
              onClick={() => {
                playClick();
                setFineOpen((o) => !o);
              }}
              className="font-pixel"
              style={{
                width: '100%',
                textAlign: 'left',
                background: '#e8e0ed',
                border: '2px solid var(--win-chrome-dark)',
                borderRightColor: 'var(--win-chrome-light)',
                borderBottomColor: 'var(--win-chrome-light)',
                padding: '6px 8px',
                fontSize: 12,
                cursor: 'pointer',
                marginBottom: fineOpen ? 8 : 14,
              }}
            >
              {fineOpen ? '▼' : '▶'} ✎ Edit the fine print
            </button>
            {fineOpen ? (
              <div style={{ marginBottom: 14 }}>
                <FineInput
                  label="Subtitle"
                  value={state.fine.subtitle ?? scaffold.subtitle}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'subtitle', value: v })
                  }
                />
                <FineInput
                  label="Subtotal value"
                  value={state.fine.subtotalPrice ?? scaffold.subtotal.price}
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
                  value={state.fine.discountLabel ?? scaffold.discount.label}
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
                  value={state.fine.taxLabel ?? scaffold.tax.label}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'taxLabel', value: v })
                  }
                />
                <FineInput
                  label="Footer"
                  value={state.fine.footer ?? scaffold.footer}
                  onChange={(v) =>
                    dispatch({ type: 'setFine', field: 'footer', value: v })
                  }
                  multiline
                />
                <WinLabel>Meme stamp</WinLabel>
                <div>
                  <ChipButton
                    active={state.memeStamp === null}
                    onClick={() => {
                      playClick();
                      dispatch({ type: 'setStamp', value: null });
                    }}
                  >
                    No stamp
                  </ChipButton>
                  {MEME_STAMPS.map((opt) => (
                    <ChipButton
                      key={opt}
                      active={state.memeStamp === opt}
                      onClick={() => {
                        playClick();
                        dispatch({ type: 'setStamp', value: opt });
                      }}
                    >
                      {opt}
                    </ChipButton>
                  ))}
                </div>
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

function LanguageToggle({
  language,
  onChange,
}: {
  language: ReceiptLanguage;
  onChange: (v: ReceiptLanguage) => void;
}) {
  return (
    <div className="mb-2.5 w-full">
      <WinLabel>Vibe / language</WinLabel>
      <div style={{ display: 'flex', gap: 6 }}>
        {(
          [
            ['en', 'English'],
            ['hinglish', 'Hinglish'],
          ] as const
        ).map(([value, label]) => (
          <WinButton
            key={value}
            variant={language === value ? 'pink' : 'grey'}
            onClick={() => onChange(value)}
            style={{ flex: 1 }}
          >
            {label}
          </WinButton>
        ))}
      </div>
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-body"
      style={{
        display: 'inline-block',
        margin: '0 6px 6px 0',
        padding: '6px 10px',
        fontSize: 12.5,
        cursor: 'pointer',
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 0,
        boxShadow: '1px 1px 0 0 #000',
        ...(active
          ? {
              background:
                'linear-gradient(180deg, var(--win-hot-pink), var(--win-magenta))',
              color: '#fff',
              borderTopColor: '#ffb1d6',
              borderLeftColor: '#ffb1d6',
              borderRightColor: '#a01060',
              borderBottomColor: '#a01060',
            }
          : {
              background: 'var(--win-chrome)',
              color: 'var(--ink, #1a0a2e)',
              borderTopColor: 'var(--win-chrome-light)',
              borderLeftColor: 'var(--win-chrome-light)',
              borderRightColor: 'var(--win-chrome-dark)',
              borderBottomColor: 'var(--win-chrome-dark)',
            }),
      }}
    >
      {children}
    </button>
  );
}

function FineInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="mb-2.5 w-full">
      <WinLabel>{label}</WinLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="font-body text-ink"
          style={{ ...fieldStyle, width: '100%', resize: 'none' }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-body text-ink"
          style={{ ...fieldStyle, width: '100%' }}
        />
      )}
    </div>
  );
}
