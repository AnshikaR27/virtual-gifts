'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MochiSprite } from '@/components/shared/craft-elements';

interface ArrivalPopupProps {
  recipientName: string;
  senderName: string;
  messageCount: number;
  onOpen: () => void;
  visible: boolean;
}

const BUBBLE_PATH =
  'M 32,168 Q 8,152 10,118 Q 3,72 16,38 Q 28,8 88,5 Q 155,-2 218,8 Q 272,16 275,58 Q 280,102 273,142 Q 266,168 232,176 Q 192,186 146,182 L 86,183 L 46,205 L 64,178 Q 44,180 32,168 Z';

const WOBBLY_UNDERLINE = 'M0,2.5 Q8,0.5 18,3 Q30,5 42,2 Q52,0 62,2.5';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function ArrivalPopup({
  recipientName,
  senderName,
  messageCount,
  onOpen,
  visible,
}: ArrivalPopupProps) {
  const [phase, setPhase] = useState<
    'waiting' | 'entering' | 'idle' | 'exiting' | 'gone'
  >('waiting');
  const [isBlinking, setIsBlinking] = useState(false);
  const reducedMotion = useReducedMotion();
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const mochiControls = useAnimation();
  const bubbleControls = useAnimation();

  useEffect(() => {
    if (visible && phase === 'waiting') {
      setPhase('entering');
    }
  }, [visible, phase]);

  useEffect(() => {
    if (!visible && phase !== 'exiting' && phase !== 'gone') {
      setPhase('gone');
    }
  }, [visible, phase]);

  useEffect(() => {
    if (phase !== 'entering') return;
    let cancelled = false;

    async function enter() {
      if (reducedMotion) {
        mochiControls.set({ opacity: 0 });
        bubbleControls.set({ opacity: 0 });
        await mochiControls.start({ opacity: 1 }, { duration: 0.4 });
        if (cancelled) return;
        await bubbleControls.start({ opacity: 1 }, { duration: 0.4 });
      } else {
        mochiControls.set({ x: -80, y: 60, opacity: 0 });
        bubbleControls.set({ scale: 0.3, opacity: 0, y: 20 });
        await mochiControls.start(
          { x: 0, y: 0, opacity: 1 },
          { type: 'spring', stiffness: 120, damping: 18 },
        );
        if (cancelled) return;
        await bubbleControls.start(
          { scale: 1, opacity: 1, y: 0 },
          { type: 'spring', stiffness: 180, damping: 14, mass: 0.8 },
        );
      }
      if (!cancelled) setPhase('idle');
    }

    enter();
    return () => {
      cancelled = true;
    };
  }, [phase, reducedMotion, mochiControls, bubbleControls]);

  useEffect(() => {
    if (phase !== 'idle' || reducedMotion) return;
    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [phase, reducedMotion]);

  const handleOkay = useCallback(async () => {
    if (phase !== 'idle') return;
    onOpen();
    setPhase('exiting');

    if (reducedMotion) {
      await Promise.all([
        bubbleControls.start({ opacity: 0 }, { duration: 0.3 }),
        mochiControls.start({ opacity: 0 }, { duration: 0.3 }),
      ]);
    } else {
      await bubbleControls.start(
        { scale: 0, opacity: 0 },
        { duration: 0.2, ease: 'easeIn' },
      );
      await mochiControls.start({ rotate: [0, -8, 8, 0] }, { duration: 0.4 });
      await mochiControls.start(
        { x: 300, opacity: 0 },
        { duration: 0.6, ease: 'easeIn' },
      );
    }

    setPhase('gone');
  }, [phase, onOpen, reducedMotion, mochiControls, bubbleControls]);

  if (phase === 'gone' || phase === 'waiting') return null;

  return (
    <div className="fixed inset-0 z-[60]" style={{ pointerEvents: 'none' }}>
      {/* Subtle dim overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(245, 240, 235, 0.25)',
          pointerEvents: phase === 'idle' ? 'auto' : 'none',
        }}
        onClick={handleOkay}
      />

      {/* Mochi + bubble group, anchored bottom-left */}
      <div
        className="absolute bottom-[100px] left-[40px] md:bottom-[120px] md:left-[80px]"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Speech bubble above Mochi */}
        <motion.div
          className="relative mb-1"
          style={{ width: 280, height: 210 }}
          animate={bubbleControls}
        >
          <svg
            className="absolute inset-0"
            viewBox="0 0 290 210"
            fill="none"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(120, 0, 55, 0.15))',
            }}
          >
            <path
              d={BUBBLE_PATH}
              fill="#FFFCF6"
              stroke="#A08060"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          <div
            className="relative z-10"
            style={{ padding: '20px 28px 12px 32px' }}
          >
            <p className="font-handwritten text-[20px] leading-snug text-[#3D2817]">
              oh hi! <DoodleHeart />
            </p>
            <p className="mt-1.5 font-handwritten text-[17px] leading-snug text-[#3D2817]">
              this jar is for you, {recipientName}
            </p>
            <p className="mt-1 font-handwritten text-[17px] leading-snug text-[#3D2817]">
              {senderName} put {messageCount} hearts inside —
            </p>
            <p className="mt-0.5 font-handwritten text-[17px] leading-snug text-[#3D2817]">
              give it a shake to see one!
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOkay();
              }}
              className="group relative mt-3 inline-block min-h-[44px] min-w-[44px] px-2 py-1 transition-transform hover:scale-105 active:scale-95"
              aria-label="Dismiss and start"
            >
              <span className="font-handwritten text-[18px] text-[#3D2817]">
                okay <DoodleHeart size={11} />
              </span>
              <svg
                className="absolute bottom-1 left-2"
                viewBox="0 0 62 5"
                width="58"
                height="4"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={WOBBLY_UNDERLINE}
                  stroke="#3D2817"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Mochi character — motion wrapper for enter/exit, inner div for idle bob */}
        <motion.div animate={mochiControls}>
          <div
            className={`[&_.desktop-pet-sprite]:w-[120px] ${phase === 'idle' && !reducedMotion ? 'desktop-pet-bobber' : ''}`}
          >
            <MochiSprite
              side="left"
              isKissing={false}
              isBlinking={isBlinking}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DoodleHeart({ size = 14 }: { size?: number }) {
  const h = Math.round(size * 0.93);
  return (
    <svg
      className="mb-0.5 inline-block"
      viewBox="0 0 14 13"
      width={size}
      height={h}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7,12 Q1,7 1.5,4.5 Q2,2 4,2 Q5.5,2 7,4.5 Q8.5,2 10,2 Q12,2 12.5,4.5 Q13,7 7,12Z"
        fill="none"
        stroke="#3D2817"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
