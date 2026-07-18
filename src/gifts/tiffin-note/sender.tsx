'use client';

import { useReducer, useState } from 'react';
import { Window } from '@/components/ui/window';
import { WinButton } from '@/components/ui/win-button';
import { WinInput } from '@/components/ui/win-input';
import { WinSelect } from '@/components/ui/win-select';
import { HandwrittenTextarea } from '@/components/ui/handwritten-textarea';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { playClick } from '@/components/retro-sounds';
import { buildWaUrl } from '@/lib/whatsapp';
import { createTiffinNote } from './actions';
import {
  DEFAULT_MIDDLE_DABBA,
  DEFAULT_TOP_DABBA,
  NOTE_MAX_LENGTH,
  NOTE_PLACEHOLDERS,
  SNACK_OPTIONS,
  SWEET_OPTIONS,
} from './menu';

interface State {
  step: 1 | 2 | 3;
  recipientName: string;
  senderName: string;
  topDabba: string;
  middleDabba: string;
  noteText: string;
}

type Action =
  | { type: 'set'; field: keyof Omit<State, 'step'>; value: string }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goto'; step: State['step'] };

const initialState: State = {
  step: 1,
  recipientName: '',
  senderName: '',
  topDabba: DEFAULT_TOP_DABBA,
  middleDabba: DEFAULT_MIDDLE_DABBA,
  noteText: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'next':
      return { ...state, step: Math.min(state.step + 1, 3) as State['step'] };
    case 'back':
      return { ...state, step: Math.max(state.step - 1, 1) as State['step'] };
    case 'goto':
      return { ...state, step: action.step };
    default:
      return state;
  }
}

const SUBTITLE_STYLE = {
  fontSize: 12,
  color: 'rgba(26, 10, 46, 0.7)',
  lineHeight: 1.4,
} as const;

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
      <p style={{ ...SUBTITLE_STYLE, marginBottom: 14 }}>{subtitle}</p>
    </>
  );
}

export function TiffinNoteSender() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof Omit<State, 'step'>) => (value: string) =>
    dispatch({ type: 'set', field, value });

  const next = () => {
    playClick();
    dispatch({ type: 'next' });
  };
  const back = () => {
    playClick();
    dispatch({ type: 'back' });
  };

  const canContinueStep1 = state.recipientName.trim().length > 0;
  const canContinueStep2 = state.noteText.trim().length > 0;

  const handleSend = async () => {
    if (pending) return;
    playClick();
    setPending(true);
    setError(null);
    try {
      const { shortId } = await createTiffinNote({
        recipientName: state.recipientName,
        senderName: state.senderName,
        topDabba: state.topDabba,
        middleDabba: state.middleDabba,
        noteText: state.noteText,
      });
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
    <div className="mx-auto w-full max-w-[360px]">
      <Window title={<span className="font-pixel">🍱 TIFFIN.exe</span>}>
        <MultiStepForm step={state.step}>
          {/* ── Step 1 — pack the tiffin ── */}
          <div>
            <Headline
              title="Pack their tiffin 🍱"
              subtitle="Three layers. The note is the secret one."
            />
            <WinInput
              label="Pack this for:"
              value={state.recipientName}
              onChange={(e) => set('recipientName')(e.target.value)}
              placeholder="Their name"
              maxLength={40}
            />
            <WinSelect
              label="Top dabba — sweet:"
              value={state.topDabba}
              onChange={set('topDabba')}
              options={[...SWEET_OPTIONS]}
            />
            <WinSelect
              label="Middle dabba — snack:"
              value={state.middleDabba}
              onChange={set('middleDabba')}
              options={[...SNACK_OPTIONS]}
            />
            <div
              className="font-body italic"
              style={{
                background: '#e8e0ed',
                borderStyle: 'solid',
                borderWidth: 2,
                borderTopColor: 'var(--win-chrome-dark)',
                borderLeftColor: 'var(--win-chrome-dark)',
                borderRightColor: 'var(--win-chrome-light)',
                borderBottomColor: 'var(--win-chrome-light)',
                padding: '6px 8px',
                fontSize: 12,
                color: 'rgba(26, 10, 46, 0.55)',
                marginBottom: 10,
              }}
            >
              🤫 your secret note — coming next
            </div>
            <div className="mt-3 flex gap-2">
              <WinButton variant="grey" disabled>
                ◀ Back
              </WinButton>
              <WinButton
                variant="pink"
                onClick={next}
                disabled={!canContinueStep1}
                style={canContinueStep1 ? undefined : { opacity: 0.6 }}
              >
                Next ▶
              </WinButton>
            </div>
          </div>

          {/* ── Step 2 — the note ── */}
          <div>
            <Headline
              title="Slip in your note ✍️"
              subtitle="Talk to them like mom does. Short. Warm. Slightly bossy."
            />
            <HandwrittenTextarea
              label="Your note (handwritten):"
              value={state.noteText}
              onChange={set('noteText')}
              maxLength={NOTE_MAX_LENGTH}
              placeholders={NOTE_PLACEHOLDERS}
            />
            <WinInput
              label="Signed:"
              value={state.senderName}
              onChange={(e) => set('senderName')(e.target.value)}
              placeholder="Your name"
              maxLength={40}
            />
            <div className="mt-3 flex gap-2">
              <WinButton variant="grey" onClick={back}>
                ◀ Back
              </WinButton>
              <WinButton
                variant="pink"
                onClick={next}
                disabled={!canContinueStep2}
                style={canContinueStep2 ? undefined : { opacity: 0.6 }}
              >
                Wrap it ▶
              </WinButton>
            </div>
          </div>

          {/* ── Step 3 — review & send ── */}
          <div>
            <Headline
              title="Tiffin's ready 🎀"
              subtitle="Review before it goes out into the world."
            />
            <TiffinPreview
              recipientName={state.recipientName || 'them'}
              senderName={state.senderName || 'you'}
              topDabba={state.topDabba}
              middleDabba={state.middleDabba}
              noteText={state.noteText}
            />
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
            <div className="mt-3 flex gap-2">
              <WinButton variant="grey" onClick={back} disabled={pending}>
                ◀ Edit
              </WinButton>
              <WinButton
                variant="whatsapp"
                onClick={handleSend}
                disabled={pending}
              >
                {pending ? 'Sending…' : 'Send 💌'}
              </WinButton>
            </div>
          </div>
        </MultiStepForm>
      </Window>
    </div>
  );
}

function TiffinPreview({
  recipientName,
  senderName,
  topDabba,
  middleDabba,
  noteText,
}: {
  recipientName: string;
  senderName: string;
  topDabba: string;
  middleDabba: string;
  noteText: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid var(--ink, #1a0a2e)',
        padding: '12px 14px',
        margin: '8px 0 12px',
        boxShadow: '3px 3px 0 var(--ink, #1a0a2e)',
      }}
    >
      <div
        className="font-pixel"
        style={{
          background: 'var(--win-magenta)',
          color: '#fff',
          fontSize: 12,
          textAlign: 'center',
          padding: 3,
          letterSpacing: '1px',
          margin: '-12px -14px 8px',
        }}
      >
        FOR {recipientName.toUpperCase()} — FROM {senderName.toUpperCase()}
      </div>
      <PreviewRow label="Top dabba" value={topDabba} />
      <PreviewRow label="Middle dabba" value={middleDabba} />
      <PreviewRow label="Bottom dabba" value={noteText || '…'} handwritten />
    </div>
  );
}

function PreviewRow({
  label,
  value,
  handwritten,
}: {
  label: string;
  value: string;
  handwritten?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '4px 0',
        borderBottom: '1px dashed rgba(26, 10, 46, 0.2)',
        fontSize: 13,
      }}
    >
      <span
        className="font-pixel uppercase"
        style={{
          fontSize: 11,
          color: 'rgba(26, 10, 46, 0.6)',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
      <span
        className={handwritten ? 'font-handwritten' : 'font-body'}
        style={
          handwritten
            ? {
                fontSize: 16,
                color: 'var(--ink, #1a0a2e)',
                textAlign: 'right',
                marginLeft: 12,
              }
            : {
                fontWeight: 500,
                color: 'var(--ink, #1a0a2e)',
                textAlign: 'right',
                marginLeft: 12,
              }
        }
      >
        {value}
      </span>
    </div>
  );
}
