'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { GameFrame } from '@/components/game/game-frame';
import { PixelHUD } from '@/components/game/pixel-hud';
import { SpeechBubble } from '@/components/game/speech-bubble';
import { ScorePopup } from '@/components/game/score-popup';
import { LevelCompleteScreen } from '@/components/game/level-complete-screen';
import { KitchenBackdrop } from '@/components/game/kitchen-backdrop';
import { playClick, playSfx } from '@/components/game/sfx';
import { TiffinSprite } from './sprites/tiffin-sprite';
import { PinkBlobMascot } from './sprites/mascot';
import { getItemSprite } from './sprites/item-sprites';

type Screen = 'boot' | 'levelStart' | 'unboxing' | 'note' | 'complete';

interface TiffinContent {
  top_dabba?: string;
  middle_dabba?: string;
  note_text?: string;
  sender_name?: string;
}

// ── small inline helpers ──────────────────────────────────────────────

const STARFIELD: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  backgroundImage: [
    'radial-gradient(circle at 12% 22%, #ff6ec7 0.5px, transparent 1.5px)',
    'radial-gradient(circle at 78% 14%, #ffe66d 0.5px, transparent 1.5px)',
    'radial-gradient(circle at 38% 78%, #fff 0.5px, transparent 1.5px)',
    'radial-gradient(circle at 88% 56%, #ff6ec7 0.5px, transparent 1.5px)',
    'radial-gradient(circle at 18% 60%, #ffe66d 0.5px, transparent 1.5px)',
    'radial-gradient(circle at 62% 36%, #fff 0.5px, transparent 1.5px)',
    'radial-gradient(circle at 92% 80%, #ffe66d 0.5px, transparent 1.5px)',
    'radial-gradient(circle at 32% 40%, #ff6ec7 0.5px, transparent 1.5px)',
  ].join(','),
};

function Starfield() {
  return <div style={STARFIELD} aria-hidden />;
}

function Blink({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.span
      className={className}
      style={style}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
    >
      {children}
    </motion.span>
  );
}

/** Full-stage transparent tap target that advances the game. */
function TapLayer({ label, onTap }: { label: string; onTap: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onTap}
      className="absolute inset-0 z-20 cursor-pointer bg-transparent"
    />
  );
}

// ── receiver ──────────────────────────────────────────────────────────

export function TiffinNoteReceiver({ gift }: { gift: GiftData }) {
  const { onClimax, trackInteraction } = useGiftContext();
  const content = gift.contentJsonb as TiffinContent;

  const topDabba = content.top_dabba || 'Gulab Jamun';
  const middleDabba = content.middle_dabba || 'Mathri';
  const noteText = (content.note_text || '').trim();
  const senderName = gift.senderName || content.sender_name || 'someone';

  const [screen, setScreen] = useState<Screen>('boot');
  const [revealed, setRevealed] = useState(0); // dabbas revealed: 0..2
  const [score, setScore] = useState(0);
  const climaxFired = useRef(false);

  const advance = useCallback(() => {
    playClick();
    setScreen((current) => {
      switch (current) {
        case 'boot':
          playSfx('jingle');
          return 'levelStart';
        case 'levelStart':
          setRevealed(1);
          setScore(200);
          playSfx('bloop');
          trackInteraction('tiffin_unlatched');
          return 'unboxing';
        case 'unboxing':
          if (revealed < 2) {
            setRevealed(2);
            setScore(400);
            playSfx('bloop');
            return 'unboxing';
          }
          setScore(700);
          return 'note';
        case 'note':
          if (!climaxFired.current) {
            climaxFired.current = true;
            onClimax();
            trackInteraction('note_read');
            playSfx('victory');
          }
          return 'complete';
        default:
          return current;
      }
    });
  }, [revealed, onClimax, trackInteraction]);

  const retry = useCallback(() => {
    playClick();
    climaxFired.current = false;
    setRevealed(0);
    setScore(0);
    setScreen('boot');
  }, []);

  // ── BOOT ──
  if (screen === 'boot') {
    return (
      <GameFrame
        stageClassName="!justify-center"
        stageStyle={{ background: '#1a0a2e', padding: '24px 16px' }}
      >
        <Starfield />
        <p
          className="relative font-pixel"
          style={{
            color: '#ff6ec7',
            fontSize: 11,
            letterSpacing: '2px',
            marginBottom: 18,
          }}
        >
          TIFFIN.exe v1.0 — LOADED
        </p>
        <TiffinSprite
          variant="closed"
          width={88}
          style={{ position: 'relative' }}
        />
        <h3
          className="relative font-pixel"
          style={{
            color: '#fff',
            fontSize: 22,
            letterSpacing: '3px',
            textShadow: '3px 3px 0 #ff1493',
            margin: '18px 0 4px',
          }}
        >
          PACKED LUNCH
        </h3>
        <p
          className="relative font-pixel"
          style={{
            color: '#c8a2e8',
            fontSize: 12,
            letterSpacing: '2px',
            marginBottom: 24,
          }}
        >
          ─ LEVEL 1 ─
        </p>
        <Blink
          className="relative font-pixel"
          style={{ color: '#ffe66d', fontSize: 16, letterSpacing: '2px' }}
        >
          ▶ PRESS START
        </Blink>
        <p
          className="absolute font-pixel"
          style={{
            color: '#6e5ba5',
            fontSize: 10,
            letterSpacing: '1px',
            bottom: 14,
          }}
        >
          © 2026 HONEYHEARTS
        </p>
        <TapLayer label="Press start" onTap={advance} />
      </GameFrame>
    );
  }

  // ── LEVEL COMPLETE ──
  if (screen === 'complete') {
    return (
      <GameFrame stageStyle={{ background: '#1a0a2e' }}>
        <Starfield />
        <LevelCompleteScreen
          stars={3}
          rows={[
            { label: 'TIFFIN OPENED', value: '+100' },
            { label: 'DABBAS UNBOXED', value: '+200' },
            { label: 'NOTE READ', value: '+500' },
            { label: 'LOVE RECEIVED', value: '∞' },
            { label: 'FINAL', value: 'S RANK ♥', total: true },
          ]}
          sendBackHref="/create/tiffin-note"
          sendBackLabel="▶ SEND ONE BACK"
          onRetry={retry}
          retryLabel="RETRY LEVEL"
        />
      </GameFrame>
    );
  }

  // ── NOTE (final item) ──
  if (screen === 'note') {
    return (
      <GameFrame
        hud={<PixelHUD score={score} showLivesLabel={false} />}
        controls={<Blink>▶ TAP WHEN DONE READING</Blink>}
      >
        <Starfield />
        <Blink
          className="relative z-[2] font-pixel"
          style={{
            background: '#ff1493',
            color: '#fff',
            fontSize: 13,
            padding: '4px 12px',
            letterSpacing: '2px',
            border: '2px solid #fff',
            boxShadow: '3px 3px 0 #000',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          ★ FINAL ITEM ★
        </Blink>
        <NoteCard noteText={noteText} senderName={senderName} />
        <TapLayer label="Done reading" onTap={advance} />
      </GameFrame>
    );
  }

  // ── LEVEL START + UNBOXING (kitchen scenes) ──
  const isUnboxing = screen === 'unboxing';
  const currentItemName = revealed >= 2 ? middleDabba : topDabba;
  const currentItemLabel = revealed >= 2 ? 'MIDDLE DABBA' : 'TOP DABBA';
  const ItemSprite = getItemSprite(currentItemName);

  return (
    <GameFrame
      hud={<PixelHUD score={score} showLivesLabel={!isUnboxing} />}
      controls={
        <Blink>
          {isUnboxing ? '▶ TAP FOR NEXT LAYER' : '▶ TAP TO UNLATCH'}
        </Blink>
      }
    >
      <KitchenBackdrop />

      {!isUnboxing ? (
        <div
          className="relative z-[2] mb-3 flex items-end gap-2 self-start"
          style={{ marginLeft: 4 }}
        >
          <PinkBlobMascot waving size={44} />
          <SpeechBubble>
            u got a tiffin from {senderName.toUpperCase()}! ♥
          </SpeechBubble>
        </div>
      ) : (
        <div
          className="relative z-[2] flex gap-1 p-1"
          style={{
            background: '#14052a',
            border: '1px solid #6e3aa5',
            marginBottom: 12,
          }}
        >
          {[0, 1, 2].map((slot) => {
            const filled = slot < revealed;
            const name =
              slot === 0 ? topDabba : slot === 1 ? middleDabba : null;
            const Slot = name ? getItemSprite(name) : null;
            return (
              <div
                key={slot}
                className="flex items-center justify-center font-pixel"
                style={{
                  width: 22,
                  height: 22,
                  background: filled ? '#4a2474' : '#2a0a4a',
                  border: '1px solid #6e3aa5',
                  color: '#6e3aa5',
                  fontSize: 14,
                }}
              >
                {filled && Slot ? <Slot size={14} /> : '?'}
              </div>
            );
          })}
        </div>
      )}

      {isUnboxing ? (
        <ScorePopup key={revealed} style={{ top: '34%', right: '18%' }}>
          +100 ♥
        </ScorePopup>
      ) : null}

      <TiffinSprite
        variant={isUnboxing ? 'open' : 'closed'}
        width={isUnboxing ? 88 : 76}
        style={{ position: 'relative', zIndex: 1 }}
      />

      {isUnboxing ? (
        <p
          className="relative z-[2] mt-2 flex items-center justify-center gap-1.5 text-center font-pixel"
          style={{ color: '#fff', fontSize: 12, letterSpacing: '1px' }}
        >
          <ItemSprite size={16} />
          {currentItemLabel}:{' '}
          <span style={{ color: '#ffe66d' }}>
            {currentItemName.toUpperCase()}
          </span>
        </p>
      ) : null}

      <TapLayer
        label={isUnboxing ? 'Reveal next layer' : 'Unlatch the tiffin'}
        onTap={advance}
      />
    </GameFrame>
  );
}

function NoteCard({
  noteText,
  senderName,
}: {
  noteText: string;
  senderName: string;
}) {
  const lines = noteText.length > 0 ? noteText.split('\n') : ['💌'];
  return (
    <div
      className="relative z-[2]"
      style={{
        background: '#fffef9',
        border: '2px solid #2a2540',
        padding: '18px 12px 14px',
        boxShadow: '4px 4px 0 #ff1493',
        width: '84%',
        transform: 'rotate(-1.5deg)',
        marginTop: 8,
      }}
    >
      <span
        className="absolute font-pixel"
        style={{
          top: -2,
          left: -2,
          background:
            'linear-gradient(90deg, var(--win-title-start), var(--win-title-end))',
          color: '#fff',
          fontSize: 11,
          padding: '2px 8px',
          letterSpacing: '1px',
        }}
      >
        NOTE.txt
      </span>
      <p
        className="font-handwritten"
        style={{ fontSize: 20, lineHeight: '24px', color: '#2a2540' }}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
      <p
        className="font-handwritten"
        style={{
          fontSize: 16,
          color: '#2a2540',
          marginTop: 12,
          textAlign: 'right',
          opacity: 0.85,
        }}
      >
        — {senderName.toLowerCase()}
      </p>
    </div>
  );
}
