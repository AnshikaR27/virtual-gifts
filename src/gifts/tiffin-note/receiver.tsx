'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { playClick } from '@/components/retro-sounds';

interface TiffinContent {
  top_dabba?: string;
  middle_dabba?: string;
  note_text?: string;
  sender_name?: string;
}

// Café backdrop. Downscaled from the raw 6.3 MB / 1536px source to 1200px
// (palette-quantized PNG, 1.27 MB in-repo). next/image transcodes it to an
// optimized WebP/AVIF on the wire (~70 KB) with a blur-up placeholder.
const BG_SRC = '/gifts/tiffin-note/canteen-bg.png';
const BG_BLUR =
  'data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAACwBACdASoQAB0ALmlIpFIiJaWlhYBoSgCdMoR4HtApwC5X2pR9LybZMKASvc5AAP78j6dp4NPhf5ISmpc0e234DOF/wBBa6Vjn48HcOfPtDVmKyRLtiCi3aF4yZLxCPsFg0ZZW5LgbvqNrwZguuE4Pq0aFcI7rjINckBA5Ds2qSg+RzaOb4Py1xAZ6sACPdRF98U81n1P0SLEjyfh45kEbopH9LRSbrnDEAAAA';

// ── faceted steel tiffin geometry (ported from the spec) ──────────────
const R = 60;
const H = 42;
const SEGS = 32;
const GAP = H;
const LIGHT_DEG = -32;
const STEEL_LO = [158, 150, 178];
const STEEL_HI = [250, 250, 255];

function steel(t: number): string {
  const e = Math.pow(t, 1.3);
  const c = STEEL_LO.map((v, i) => Math.round(v + (STEEL_HI[i] - v) * e));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

interface DabbaSpec {
  radius: number;
  height: number;
  segs: number;
  noLip?: boolean;
  topFill?: string;
}

function useDabbaSegments({ radius, height, segs, noLip, topFill }: DabbaSpec) {
  return useMemo(() => {
    const step = 360 / segs;
    const w = (2 * Math.PI * radius) / segs + 1.4;
    const segments = Array.from({ length: segs }, (_, i) => {
      const a = i * step;
      const t = (Math.cos(((a - LIGHT_DEG) * Math.PI) / 180) + 1) / 2;
      const style: CSSProperties = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: w,
        height,
        marginLeft: -w / 2,
        marginTop: -height / 2,
        backfaceVisibility: 'hidden',
        transform: `rotateY(${a}deg) translateZ(${radius}px)`,
        background: steel(t),
        ...(noLip
          ? {}
          : {
              borderTop: `2px solid rgba(255,255,255,${0.12 + 0.26 * t})`,
              borderBottom: '2px solid rgba(80,40,90,0.18)',
            }),
      };
      return style;
    });

    const disc = (z: number, fill: string): CSSProperties => ({
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: radius * 2,
      height: radius * 2,
      marginLeft: -radius,
      marginTop: -radius,
      borderRadius: '50%',
      transform: `rotateX(90deg) translateZ(${z}px)`,
      background: fill,
    });

    return {
      segments,
      top: disc(
        height / 2,
        topFill ||
          'radial-gradient(circle at 42% 38%, #fbf6ff, #cdc2da 60%, #9b90ad)',
      ),
      bottom: disc(-height / 2, 'radial-gradient(circle,#7a7088,#403848)'),
    };
  }, [radius, height, segs, noLip, topFill]);
}

function Dabba({ spec, style }: { spec: DabbaSpec; style?: CSSProperties }) {
  const { segments, top, bottom } = useDabbaSegments(spec);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {segments.map((s, i) => (
        <div key={i} style={s} />
      ))}
      <div style={top} />
      <div style={bottom} />
    </div>
  );
}

// ── the 3D tiffin (tilt + continuous spin + tap-to-open) ──────────────
function Tiffin3D({ open }: { open: boolean }) {
  const spinRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    let angle = -22;
    let raf = 0;
    const tick = () => {
      if (!openRef.current) {
        angle += 0.34;
      } else {
        // ease the front face toward the viewer when open
        const diff = (((0 - angle + 540) % 360) - 180) * 0.1;
        angle += diff;
      }
      if (spinRef.current) {
        spinRef.current.style.transform = `rotateY(${angle}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const baseY = [GAP, 0, -GAP];
  const lift = (idx: number) =>
    open ? (idx === 2 ? -54 : idx === 1 ? -22 : 0) : 0;
  const lidBaseY = -GAP - H / 2 - 8;
  const handleBaseY = lidBaseY;

  const dabbaTransition = 'transform .9s cubic-bezier(.2,.9,.2,1)';
  const lidTransition = 'transform .95s cubic-bezier(.3,1.1,.3,1)';

  return (
    <div style={{ position: 'relative', transformStyle: 'preserve-3d' }}>
      <div
        style={{ transform: 'rotateX(-15deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          ref={spinRef}
          style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          <div style={{ position: 'relative', transformStyle: 'preserve-3d' }}>
            {/* three dabbas */}
            {[0, 1, 2].map((idx) => (
              <Dabba
                key={idx}
                spec={{ radius: R, height: H, segs: SEGS }}
                style={{
                  transform: `translateY(${baseY[idx] + lift(idx)}px)`,
                  transition: dabbaTransition,
                }}
              />
            ))}

            {/* lid + knob */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transformStyle: 'preserve-3d',
                transform: `translateY(${lidBaseY + (open ? -150 : 0)}px) rotateZ(${open ? 8 : 0}deg)`,
                transition: lidTransition,
              }}
            >
              <Dabba
                spec={{
                  radius: R + 2,
                  height: 16,
                  segs: SEGS,
                  noLip: true,
                  topFill:
                    'radial-gradient(circle at 42% 36%, #fffafd, #d3c8e0 58%, #a298b3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 26,
                  height: 26,
                  marginLeft: -13,
                  marginTop: -13,
                  borderRadius: '50%',
                  transform: 'rotateX(90deg) translateZ(20px)',
                  background:
                    'radial-gradient(circle at 38% 32%, #ffc2e4, var(--win-magenta) 70%, #b00d68)',
                  boxShadow: '0 0 14px rgba(255,20,147,.7)',
                }}
              />
            </div>

            {/* carry handle (two rods + top bar) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transformStyle: 'preserve-3d',
                transform: `translateY(${handleBaseY + (open ? -150 : 0)}px)`,
                transition: lidTransition,
              }}
            >
              {[-R + 6, R - 6].map((x) => (
                <div
                  key={x}
                  style={{
                    position: 'absolute',
                    width: 5,
                    height: 66,
                    left: -2.5,
                    top: -66,
                    borderRadius: 4,
                    transform: `translateX(${x}px)`,
                    background:
                      'linear-gradient(90deg,#9aa0b4,#fbfdff 45%,#b3bacb)',
                  }}
                />
              ))}
              <div
                style={{
                  position: 'absolute',
                  height: 5,
                  width: (R - 6) * 2,
                  left: -(R - 6),
                  top: -70,
                  borderRadius: '8px 8px 0 0',
                  background: 'linear-gradient(180deg,#fbfdff,#b3bacb)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── confetti burst (Web Animations API, no keyframes needed) ──────────
const CONF_COLORS = [
  '#ff8fce',
  '#ffd6ef',
  '#aef0d8',
  '#fff0a8',
  '#bfe6ff',
  '#ff1493',
  '#ba55d3',
];

function ConfettiLayer({ fireKey }: { fireKey: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fireKey === 0 || !ref.current) return;
    const layer = ref.current;
    layer.innerHTML = '';
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('div');
      c.style.position = 'absolute';
      c.style.top = '48%';
      c.style.left = '50%';
      c.style.width = i % 4 === 0 ? '10px' : '9px';
      c.style.height = i % 4 === 0 ? '10px' : '13px';
      c.style.borderRadius = i % 4 === 0 ? '50%' : '2px';
      c.style.background = CONF_COLORS[i % CONF_COLORS.length];
      c.style.willChange = 'transform,opacity';
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 150;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - 40 - Math.random() * 60;
      const rot = Math.random() * 720 - 360;
      c.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`,
            opacity: 1,
            offset: 0.55,
          },
          {
            transform: `translate(${dx * 1.2}px,${dy + 220}px) rotate(${rot * 1.4}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1500 + Math.random() * 900,
          easing: 'cubic-bezier(.2,.7,.3,1)',
        },
      );
      layer.appendChild(c);
    }
  }, [fireKey]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 11,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}

// ── twinkling sparkles + drifting hearts ──────────────────────────────
const SPARK_CHARS = ['✦', '✧', '+', '✦'];

function Sparkles() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        char: SPARK_CHARS[i % SPARK_CHARS.length],
        left: Math.random() * 92 + 4,
        top: Math.random() * 70 + 6,
        size: 10 + Math.random() * 12,
        delay: Math.random() * 2.6,
        color: i % 3 === 0 ? '#fff7c4' : i % 3 === 1 ? '#ffd6ef' : '#fff',
      })),
    [],
  );
  const hearts = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        char: i % 2 ? '♡' : '♥',
        left: 12 + Math.random() * 72,
        size: 12 + Math.random() * 8,
        delay: Math.random() * 6,
        color: i % 2 ? '#fff7c4' : '#ff8fce',
      })),
    [],
  );

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 7,
        pointerEvents: 'none',
      }}
    >
      {sparks.map((s, i) => (
        <motion.span
          key={`s${i}`}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: s.size,
            color: s.color,
            textShadow: '0 0 8px var(--candy, #ff8fce)',
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        >
          {s.char}
        </motion.span>
      ))}
      {hearts.map((h, i) => (
        <motion.span
          key={`h${i}`}
          style={{
            position: 'absolute',
            bottom: -16,
            left: `${h.left}%`,
            fontSize: h.size,
            color: h.color,
            textShadow: '0 0 8px rgba(255,143,206,.7)',
          }}
          animate={{
            opacity: [0, 0.95, 0],
            y: [0, -200, -340],
            scale: [0.6, 1, 1.1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            delay: h.delay,
            ease: 'linear',
          }}
        >
          {h.char}
        </motion.span>
      ))}
    </div>
  );
}

// ── note card (real handwritten note) ─────────────────────────────────
function NotePop({
  open,
  noteText,
  senderName,
}: {
  open: boolean;
  noteText: string;
  senderName: string;
}) {
  const lines = noteText.length > 0 ? noteText.split('\n') : ['💌'];
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '39%',
        zIndex: 9,
        width: 212,
        transform: open
          ? 'translate(-50%,-50%) translateY(0) scale(1)'
          : 'translate(-50%,-50%) translateY(24px) scale(.9)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition:
          'opacity .6s .35s, transform .7s .35s cubic-bezier(.2,1.1,.3,1)',
        background: 'var(--paper, #fffef9)',
        border: '2px solid #2a2540',
        boxShadow:
          '5px 6px 0 var(--win-magenta), 0 16px 36px rgba(120,40,120,.35)',
        padding: '22px 16px 16px',
      }}
    >
      <span
        className="font-pixel"
        style={{
          position: 'absolute',
          top: -2,
          left: -2,
          background:
            'linear-gradient(90deg,var(--win-title-start),var(--win-title-end))',
          color: '#fff',
          fontSize: 11,
          padding: '2px 9px',
          letterSpacing: '1px',
        }}
      >
        NOTE.txt
      </span>
      <div
        className="font-pixel"
        style={{
          fontSize: 10,
          color: 'var(--win-magenta)',
          letterSpacing: '1px',
          marginBottom: 8,
        }}
      >
        FROM {senderName.toUpperCase()}
      </div>
      <div
        className="font-handwritten"
        style={{ fontSize: 23, lineHeight: '26px', color: '#2a2540' }}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </div>
      <div
        className="font-handwritten"
        style={{
          fontSize: 17,
          color: '#2a2540',
          textAlign: 'right',
          marginTop: 12,
          opacity: 0.85,
        }}
      >
        — {senderName.toLowerCase()}
      </div>
    </div>
  );
}

// ── receiver ──────────────────────────────────────────────────────────
export function TiffinNoteReceiver({ gift }: { gift: GiftData }) {
  const { onClimax, trackInteraction } = useGiftContext();
  const content = gift.contentJsonb as TiffinContent;

  const noteText = (content.note_text || '').trim();
  const senderName = gift.senderName || content.sender_name || 'someone';
  const recipientName = gift.recipientName || 'you';

  const [open, setOpen] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const climaxFired = useRef(false);

  const doOpen = useCallback(() => {
    setOpen(true);
    setConfettiKey((k) => k + 1);
    if (!climaxFired.current) {
      climaxFired.current = true;
      onClimax();
      trackInteraction('note_read');
    }
  }, [onClimax, trackInteraction]);

  const toggle = useCallback(() => {
    playClick();
    if (open) {
      setOpen(false);
    } else {
      doOpen();
    }
  }, [open, doOpen]);

  const replay = useCallback(() => {
    playClick();
    setOpen(false);
    window.setTimeout(doOpen, 700);
  }, [doOpen]);

  return (
    <div
      style={{
        position: 'relative',
        width: 'min(360px, 92vw)',
        height: 'min(680px, 86dvh)',
        borderRadius: 22,
        overflow: 'hidden',
        perspective: 1000,
        perspectiveOrigin: '50% 44%',
        boxShadow: '0 24px 60px rgba(120,60,160,.4)',
        background: '#d8c9ec',
      }}
    >
      {/* café backdrop — full-bleed, table anchored at the bottom */}
      <Image
        src={BG_SRC}
        alt=""
        fill
        priority
        placeholder="blur"
        blurDataURL={BG_BLUR}
        sizes="(max-width: 400px) 92vw, 360px"
        style={{
          objectFit: 'cover',
          objectPosition: 'center bottom',
          zIndex: 0,
        }}
      />

      <Sparkles />

      {/* swinging gift tag */}
      <motion.div
        style={{
          position: 'absolute',
          left: '50%',
          top: 12,
          zIndex: 12,
          x: '-50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transformOrigin: 'top center',
          opacity: open ? 0 : 1,
          transition: 'opacity .5s',
          pointerEvents: 'none',
        }}
        animate={open ? { rotate: 0 } : { rotate: [-3, 3, -3] }}
        transition={{
          duration: 3.4,
          repeat: open ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          style={{
            width: 2,
            height: 30,
            background:
              'repeating-linear-gradient(0deg,var(--ink,#1a0a2e) 0 4px, transparent 4px 8px)',
            opacity: 0.5,
          }}
        />
        <div
          className="font-handwritten"
          style={{
            fontSize: 19,
            color: 'var(--ink, #1a0a2e)',
            background: 'var(--paper, #fffef9)',
            padding: '6px 16px 8px',
            border: '1.5px solid rgba(26,10,46,.35)',
            boxShadow: '2px 3px 0 rgba(255,20,147,.5)',
            transform: 'rotate(-2deg)',
          }}
        >
          for {recipientName.toLowerCase()} 🎀
        </div>
      </motion.div>

      {/* from banner */}
      <div
        className="font-display"
        style={{
          position: 'absolute',
          top: 74,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 12,
          fontStyle: 'italic',
          fontSize: 15,
          color: 'var(--ink, #1a0a2e)',
          background: 'rgba(255,255,255,.62)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          padding: '5px 16px',
          borderRadius: 30,
          border: '1.5px solid rgba(255,105,180,.5)',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(186,85,211,.25)',
          opacity: open ? 0 : 1,
          transition: 'opacity .5s',
        }}
      >
        a tiffin from {senderName} ♥
      </div>

      {/* contact shadow on the front table */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '69%',
          zIndex: 1,
          width: open ? 230 : 190,
          height: 40,
          transform: 'translate(-50%,-50%)',
          background:
            'radial-gradient(ellipse, rgba(70,30,80,.42) 0%, transparent 70%)',
          filter: 'blur(3px)',
          transition: 'width .6s',
          pointerEvents: 'none',
        }}
      />

      {/* the tiffin — lower-center, resting on the front pink table */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '60%',
          transform: 'translate(-50%,-50%)',
          zIndex: 8,
          transformStyle: 'preserve-3d',
        }}
      >
        <Tiffin3D open={open} />
      </div>

      <NotePop open={open} noteText={noteText} senderName={senderName} />

      <ConfettiLayer fireKey={confettiKey} />

      {/* full-stage tap target to open/close */}
      <button
        type="button"
        aria-label={open ? 'Close the tiffin' : 'Tap to unwrap the tiffin'}
        onClick={toggle}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      />

      {/* tap hint */}
      {!open ? (
        <motion.div
          className="font-pixel"
          style={{
            position: 'absolute',
            bottom: 66,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 12,
            fontSize: 15,
            letterSpacing: '2px',
            color: '#fff',
            background:
              'linear-gradient(180deg,var(--win-hot-pink),var(--win-magenta))',
            padding: '5px 14px',
            border: '2px solid #fff',
            boxShadow: '2px 2px 0 rgba(26,10,46,.4)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [1, 1, 0.35, 0.35] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            times: [0, 0.5, 0.5, 1],
          }}
        >
          ▶ TAP TO UNWRAP
        </motion.div>
      ) : null}

      {/* action bar — slides up on open */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 14,
          padding: 14,
          display: 'flex',
          gap: 8,
          transform: open ? 'translateY(0)' : 'translateY(120%)',
          transition: 'transform .6s .55s ease',
          background:
            'linear-gradient(180deg,transparent,rgba(255,201,232,.85) 45%)',
        }}
      >
        <Link
          href="/create/tiffin-note"
          onClick={() => playClick()}
          className="font-pixel"
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 11,
            fontSize: 15,
            letterSpacing: '1px',
            textDecoration: 'none',
            cursor: 'pointer',
            boxShadow: '2px 2px 0 rgba(26,10,46,.5)',
            border: '2px solid',
            borderColor: '#6cf2a4 #128a44 #128a44 #6cf2a4',
            background:
              'linear-gradient(180deg,#34e379,var(--whatsapp-green,#25d366))',
            color: '#fff',
          }}
        >
          SEND ONE BACK 💌
        </Link>
        <button
          type="button"
          onClick={replay}
          className="font-pixel"
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 11,
            fontSize: 15,
            letterSpacing: '1px',
            cursor: 'pointer',
            boxShadow: '2px 2px 0 rgba(26,10,46,.5)',
            border: '2px solid',
            borderColor: '#ffb1d6 #a01060 #a01060 #ffb1d6',
            background:
              'linear-gradient(180deg,var(--win-hot-pink),var(--win-magenta))',
            color: '#fff',
          }}
        >
          OPEN AGAIN
        </button>
      </div>
    </div>
  );
}
