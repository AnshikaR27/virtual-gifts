'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MochiSprite } from '@/components/shared/craft-elements';

export type ScrollTextMode = 'lens' | 'beside';

type Phase =
  | 'sleeping'
  | 'scroll-falling'
  | 'startled'
  | 'picking-up'
  | 'untying'
  | 'unrolling'
  | 'squinting'
  | 'idea'
  | 'fetching'
  | 'reading'
  | 'complete'
  | 'exiting'
  | 'done';

interface Props {
  recipientName: string;
  messageCount: number;
  onComplete: () => void;
  onExitComplete: () => void;
  visible: boolean;
  textMode?: ScrollTextMode;
}

const INK = '#3D2817';
const TWINE_C = '#C19A6B';
const CREAM = '#FFFCF0';
const OUTLINE_C = '#A08060';

const PHASES: Phase[] = [
  'sleeping',
  'scroll-falling',
  'startled',
  'picking-up',
  'untying',
  'unrolling',
  'squinting',
  'idea',
  'fetching',
  'reading',
  'complete',
  'exiting',
  'done',
];

function pidx(p: Phase) {
  return PHASES.indexOf(p);
}
function gte(c: Phase, t: Phase) {
  return pidx(c) >= pidx(t);
}
function btwn(c: Phase, a: Phase, b: Phase) {
  const i = pidx(c);
  return i >= pidx(a) && i <= pidx(b);
}

/* ── hooks ─────────────────────────────────────────────── */

function useReducedMotion() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setV(mq.matches);
    const h = (e: MediaQueryListEvent) => setV(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return v;
}

function useTypewriter(text: string, active: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active || n >= text.length) return;
    const ms = 30 + Math.random() * 12;
    const t = setTimeout(() => setN((c) => c + 1), ms);
    return () => clearTimeout(t);
  }, [active, n, text.length]);
  const complete = useCallback(() => setN(text.length), [text.length]);
  return { revealed: text.slice(0, n), done: n >= text.length, complete };
}

/* ── hand-drawn SVG elements ───────────────────────────── */

function Zzz() {
  return (
    <div className="absolute" style={{ top: -50, left: '50%', marginLeft: 15 }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute select-none font-handwritten"
          style={{
            fontSize: 16 - i * 3,
            color: OUTLINE_C,
            left: i * 15,
            top: i * -14,
          }}
          animate={{
            y: [0, -5, 0],
            rotate: [-6, 6, -6],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        >
          z
        </motion.span>
      ))}
    </div>
  );
}

function ExprBubble({ char }: { char: string }) {
  return (
    <motion.span
      className="absolute select-none font-handwritten"
      style={{
        top: -42,
        left: '50%',
        marginLeft: 20,
        color: INK,
        fontSize: 22,
        fontWeight: 600,
      }}
      initial={{ opacity: 0, scale: 0.3, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
    >
      {char}
    </motion.span>
  );
}

function ScrollRolled() {
  return (
    <svg
      viewBox="0 0 38 16"
      width={38}
      height={16}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4,1.5 Q1.5,1.5 1.5,8 Q1.5,14.5 4,14.5 L34,14.5 Q36.5,14.5 36.5,8 Q36.5,1.5 34,1.5 Z"
        fill={CREAM}
        stroke={OUTLINE_C}
        strokeWidth="0.7"
      />
      <ellipse
        cx="4"
        cy="8"
        rx="2.8"
        ry="6.5"
        fill="#F5EDE0"
        stroke={OUTLINE_C}
        strokeWidth="0.5"
      />
      <ellipse
        cx="34"
        cy="8"
        rx="2.8"
        ry="6.5"
        fill="#F5EDE0"
        stroke={OUTLINE_C}
        strokeWidth="0.5"
      />
      <rect
        x="15"
        y="0.8"
        width="8"
        height="14.4"
        rx="1"
        fill="none"
        stroke={TWINE_C}
        strokeWidth="1.2"
      />
      <path
        d="M17,1 Q19,-1 21,1"
        fill={TWINE_C}
        stroke="#A07840"
        strokeWidth="0.4"
      />
      <circle
        cx="19"
        cy="0"
        r="1.6"
        fill={TWINE_C}
        stroke="#A07840"
        strokeWidth="0.3"
      />
    </svg>
  );
}

function ScrollOpen() {
  return (
    <svg
      viewBox="0 0 130 55"
      width={130}
      height={55}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5,4 Q2,3 2,27 Q2,52 5,51 L125,51 Q128,52 128,27 Q128,3 125,4 Z"
        fill={CREAM}
        stroke={OUTLINE_C}
        strokeWidth="0.6"
      />
      <path
        d="M5,4 Q1,4 2,27 Q1,51 5,51"
        fill="#F5EDE0"
        stroke={OUTLINE_C}
        strokeWidth="0.5"
      />
      <path
        d="M125,4 Q129,4 128,27 Q129,51 125,51"
        fill="#F5EDE0"
        stroke={OUTLINE_C}
        strokeWidth="0.5"
      />
      <g
        opacity="0.18"
        stroke={OUTLINE_C}
        strokeWidth="0.5"
        strokeLinecap="round"
      >
        <path d="M16,14 Q35,12 60,15 Q80,16 110,13" />
        <path d="M18,22 Q42,20 65,23 Q85,22 108,21" />
        <path d="M16,30 Q38,28 55,31 Q72,30 100,29" />
        <path d="M20,38 Q48,36 75,39 Q90,38 105,37" />
      </g>
    </svg>
  );
}

function TwineFloor() {
  return (
    <svg
      viewBox="0 0 24 10"
      width={24}
      height={10}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2,5 Q7,2 12,6 Q17,9 22,4"
        stroke={TWINE_C}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function MagGlass() {
  return (
    <svg
      viewBox="0 0 50 80"
      width={50}
      height={80}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12,24 Q10,9 25,7 Q41,9 39,24 Q41,39 25,41 Q9,39 12,24 Z"
        fill="rgba(200,220,240,0.1)"
        stroke={OUTLINE_C}
        strokeWidth="1.3"
      />
      <ellipse
        cx="18"
        cy="16"
        rx="5"
        ry="3"
        fill="white"
        opacity="0.25"
        transform="rotate(-15 18 16)"
      />
      <path
        d="M31,39 Q33,48 34,58 Q35,68 37,74"
        stroke="#8B6914"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M32,44 Q33,54 35,64"
        stroke="#A07840"
        strokeWidth="0.6"
        strokeDasharray="2,3"
      />
    </svg>
  );
}

function DoodleHeart({ size = 14 }: { size?: number }) {
  return (
    <svg
      className="mb-0.5 inline-block"
      viewBox="0 0 14 13"
      width={size}
      height={Math.round(size * 0.93)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7,12 Q1,7 1.5,4.5 Q2,2 4,2 Q5.5,2 7,4.5 Q8.5,2 10,2 Q12,2 12.5,4.5 Q13,7 7,12Z"
        fill="none"
        stroke={INK}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── main component ────────────────────────────────────── */

export function MochiScrollLanding({
  recipientName,
  messageCount,
  onComplete,
  onExitComplete,
  visible,
  textMode = 'lens',
}: Props) {
  const [phase, setPhase] = useState<Phase>('sleeping');
  const reduced = useReducedMotion();
  const stopped = useRef(false);
  const exitTmr = useRef<ReturnType<typeof setTimeout>>();

  const msg = useMemo(
    () =>
      `okay so listen, ${recipientName} ♡\nsomebody really likes you\nlike REALLY\nthey wrote you ${messageCount} little ${messageCount === 1 ? 'heart' : 'hearts'} about it`,
    [recipientName, messageCount],
  );

  const tw = useTypewriter(msg, phase === 'reading');

  /* timeline */
  useEffect(() => {
    if (reduced || !visible) return;
    const sched: [Phase, number][] = [
      ['scroll-falling', 2000],
      ['startled', 2300],
      ['picking-up', 2800],
      ['untying', 3200],
      ['unrolling', 3600],
      ['squinting', 4000],
      ['idea', 4500],
      ['fetching', 4800],
      ['reading', 5500],
    ];
    const ids = sched.map(([p, ms]) =>
      setTimeout(() => {
        if (!stopped.current) setPhase(p);
      }, ms),
    );
    return () => ids.forEach(clearTimeout);
  }, [reduced, visible]);

  useEffect(() => {
    if (phase === 'reading' && tw.done) setPhase('complete');
  }, [phase, tw.done]);

  useEffect(() => {
    if (reduced && visible) {
      tw.complete();
      setPhase('complete');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, visible]);

  useEffect(
    () => () => {
      if (exitTmr.current) clearTimeout(exitTmr.current);
    },
    [],
  );

  /* handlers */
  const skip = useCallback(() => {
    if (gte(phase, 'complete')) return;
    stopped.current = true;
    tw.complete();
    setPhase('complete');
  }, [phase, tw]);

  const proceed = useCallback(() => {
    if (phase !== 'complete') return;
    onComplete();
    if (reduced) {
      setPhase('done');
      onExitComplete();
      return;
    }
    setPhase('exiting');
    exitTmr.current = setTimeout(() => {
      setPhase('done');
      onExitComplete();
    }, 1200);
  }, [phase, reduced, onComplete, onExitComplete]);

  /* mochi motion — memoized per phase so keyframe arrays are stable */
  const mochiM = useMemo((): {
    a: Record<string, number | number[]>;
    t: Record<string, unknown>;
  } => {
    switch (phase) {
      case 'sleeping':
      case 'scroll-falling':
        return {
          a: { rotate: 8, x: 0, scaleY: 1, y: 0 },
          t: { type: 'spring', stiffness: 200, damping: 18 },
        };
      case 'startled':
        return {
          a: { rotate: 0, x: 0, scaleY: [0.88, 1.06, 1], y: 0 },
          t: { duration: 0.35 },
        };
      case 'squinting':
        return {
          a: { rotate: 0, x: 0, scaleY: 1, y: -4 },
          t: { type: 'spring', stiffness: 200, damping: 18 },
        };
      case 'fetching':
        return {
          a: {
            rotate: [0, 5, -5, 3, 0],
            x: [0, 80, 80, 0, 0],
            scaleY: 1,
            y: 0,
          },
          t: { duration: 0.7, ease: 'easeInOut' },
        };
      case 'exiting':
        return {
          a: {
            rotate: [0, -8, 8, -6, 0, 0],
            x: [0, 0, 0, 0, 50, 400],
            scaleY: 1,
            y: 0,
          },
          t: { duration: 1.0, ease: [0.4, 0, 0.2, 1] },
        };
      default:
        return {
          a: { rotate: 0, x: 0, scaleY: 1, y: 0 },
          t: { type: 'spring', stiffness: 200, damping: 18 },
        };
    }
  }, [phase]);

  const scrollM = useMemo(() => {
    if (phase === 'scroll-falling')
      return {
        a: { y: 0, x: 0, rotate: 0, opacity: 1 },
        t: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      };
    if (phase === 'startled')
      return {
        a: { y: 10, x: 35, rotate: 8, opacity: 1 },
        t: { type: 'spring', stiffness: 200, damping: 20 },
      };
    return {
      a: { y: 5, x: 0, rotate: 0, opacity: 1 },
      t: { type: 'spring', stiffness: 200, damping: 20 },
    };
  }, [phase]);

  /* bail — after all hooks */
  if (phase === 'done') return null;
  if (!visible && phase !== 'exiting') return null;

  /* derived */
  const eyesClosed =
    phase === 'sleeping' || phase === 'scroll-falling' || phase === 'squinting';
  const showZzz = phase === 'sleeping' || phase === 'scroll-falling';
  const showQ = phase === 'startled';
  const showBang = phase === 'idea';
  const showRolled = btwn(phase, 'scroll-falling', 'untying');
  const showOpen = gte(phase, 'unrolling') && !gte(phase, 'exiting');
  const showTwine = gte(phase, 'untying') && !gte(phase, 'exiting');
  const showGlass = gte(phase, 'reading') && !gte(phase, 'done');
  const showMsg = gte(phase, 'reading') && !gte(phase, 'exiting');
  const showTap = phase === 'complete';

  /* ── render ──────────────────────────────────────────── */
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
      style={{ background: '#f5f0eb' }}
      onClick={!gte(phase, 'complete') ? skip : undefined}
      animate={phase === 'exiting' ? { opacity: [1, 1, 0] } : { opacity: 1 }}
      transition={
        phase === 'exiting' ? { duration: 1.2, times: [0, 0.7, 1] } : undefined
      }
    >
      {/* warm radial blush */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(255,180,150,0.12) 0%, transparent 55%)',
        }}
      />

      {/* scene */}
      <div className="relative" style={{ width: 280, height: 250 }}>
        {/* ── Mochi ── */}
        <motion.div
          className="absolute"
          style={{
            left: '50%',
            top: 40,
            marginLeft: -60,
            transformOrigin: 'center bottom',
          }}
          animate={mochiM.a}
          transition={mochiM.t}
        >
          <div className="relative">
            <div
              className="[&_.desktop-pet-sprite]:w-[120px]"
              style={{ width: 120 }}
            >
              <MochiSprite
                side="left"
                isKissing={false}
                isBlinking={eyesClosed}
              />
            </div>
            <AnimatePresence>
              {showZzz && (
                <motion.div
                  key="zzz"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  <Zzz />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showQ && <ExprBubble key="q" char="?" />}
              {showBang && <ExprBubble key="!" char="!" />}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Rolled scroll ── */}
        <AnimatePresence>
          {showRolled && (
            <motion.div
              key="rolled"
              className="absolute"
              style={{ left: '50%', marginLeft: -19, top: 60 }}
              initial={{ y: -340, x: 15, rotate: -20 }}
              animate={scrollM.a}
              exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
              transition={scrollM.t}
            >
              <ScrollRolled />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Unrolled scroll ── */}
        <AnimatePresence>
          {showOpen && (
            <motion.div
              key="open"
              className="absolute"
              style={{ left: '50%', marginLeft: -65, top: 175 }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <ScrollOpen />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Twine on floor ── */}
        <AnimatePresence>
          {showTwine && (
            <motion.div
              key="twine"
              className="absolute"
              style={{ left: '50%', marginLeft: 45, top: 200 }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TwineFloor />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Magnifying glass ── */}
        <AnimatePresence>
          {showGlass && (
            <motion.div
              key="glass"
              className="absolute"
              style={{ left: '50%', marginLeft: -82, top: 115 }}
              initial={{ opacity: 0, x: 60, rotate: 15 }}
              animate={{ opacity: 1, x: 0, rotate: -8 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            >
              <MagGlass />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── message text ── */}
      <AnimatePresence>
        {showMsg && (
          <motion.div
            key="msg"
            style={{ marginTop: textMode === 'lens' ? -24 : 4 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
          >
            {textMode === 'lens' ? (
              <LensText text={tw.revealed} />
            ) : (
              <BesideText text={tw.revealed} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── tap to see them ── */}
      <AnimatePresence>
        {showTap && (
          <motion.button
            key="tap"
            className="mt-6 min-h-[44px] px-8 py-2 font-handwritten text-[16px]"
            style={{ color: INK }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 0.4 },
            }}
            onClick={(e) => {
              e.stopPropagation();
              proceed();
            }}
          >
            tap to see them <DoodleHeart size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Option A: text inside magnified lens circle ───────── */

function LensText({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-full"
        style={{
          width: 220,
          height: 220,
          border: `2px solid ${OUTLINE_C}`,
          background: 'rgba(255,252,246,0.92)',
          boxShadow: '0 0 24px rgba(160,128,96,0.08)',
        }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            top: 18,
            left: '50%',
            marginLeft: -28,
            width: 40,
            height: 18,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            transform: 'rotate(-10deg)',
          }}
        />
        <div className="px-5 py-3 text-center">
          <MsgLines text={text} size={14} />
        </div>
      </div>
    </div>
  );
}

/* ── Option B: text beside/below the scene ─────────────── */

function BesideText({ text }: { text: string }) {
  return (
    <div className="px-6 text-center" style={{ maxWidth: 320 }}>
      <MsgLines text={text} size={18} />
    </div>
  );
}

/* ── shared line renderer ──────────────────────────────── */

function MsgLines({ text, size }: { text: string; size: number }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((ln, i) => {
        if (!ln) return null;
        return (
          <p
            key={i}
            className="font-handwritten leading-relaxed"
            style={{
              color: INK,
              fontSize: ln.includes('REALLY') ? size + 3 : size,
            }}
          >
            {fmtLine(ln)}
          </p>
        );
      })}
    </div>
  );
}

function fmtLine(ln: string) {
  if (ln.includes('♡')) {
    const [a, b] = ln.split('♡');
    return (
      <>
        {a}
        <DoodleHeart size={13} />
        {b}
      </>
    );
  }
  if (ln.includes('REALLY')) {
    const [a, b] = ln.split('REALLY');
    return (
      <>
        {a}
        <span className="font-semibold" style={{ fontSize: '1.15em' }}>
          REALLY
        </span>
        {b}
      </>
    );
  }
  return ln;
}
