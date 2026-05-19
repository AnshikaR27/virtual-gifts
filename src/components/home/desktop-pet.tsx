'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type MochiSide = 'left' | 'right';

interface MochiPalette {
  body: string;
  outline: string;
  highlight: string;
  cheek: string;
  feet: string;
  eyeDark: string;
  eyeShine: string;
}

interface LeftPalette extends MochiPalette {
  wingOuter: string;
  wingInner: string;
  bow: string;
  bowShadow: string;
  bowCenter: string;
}

interface RightPalette extends MochiPalette {
  cowlickBase: string;
  cowlickTip: string;
}

const LEFT_PALETTE: LeftPalette = {
  body: '#FFD6EC',
  outline: '#CC6699',
  highlight: '#FFF0F8',
  wingOuter: '#FFF0F8',
  wingInner: '#FFE0EF',
  cheek: '#FF8FAB',
  feet: '#FFB8D4',
  eyeDark: '#1A0A2E',
  eyeShine: '#4A2A5E',
  bow: '#FF1493',
  bowShadow: '#CC1177',
  bowCenter: '#FFE0F0',
};

const RIGHT_PALETTE: RightPalette = {
  body: '#FFE5A3',
  outline: '#C9963F',
  highlight: '#FFF8DD',
  cheek: '#FF8FAB',
  feet: '#FFD680',
  eyeDark: '#1A0A2E',
  eyeShine: '#4A2A5E',
  cowlickBase: '#C9963F',
  cowlickTip: '#C9963F',
};

function MochiSprite({
  side,
  isKissing,
  isBlinking,
}: {
  side: MochiSide;
  isKissing: boolean;
  isBlinking: boolean;
}) {
  const p: MochiPalette = side === 'left' ? LEFT_PALETTE : RIGHT_PALETTE;

  return (
    <svg
      viewBox="0 0 18 20"
      className="desktop-pet-sprite"
      shapeRendering="crispEdges"
      fill="none"
    >
      {side === 'left' ? (
        <>
          <rect
            x="3"
            y="0"
            width="2"
            height="1"
            fill={LEFT_PALETTE.wingOuter}
          />
          <rect
            x="4"
            y="1"
            width="1"
            height="1"
            fill={LEFT_PALETTE.wingInner}
          />
          <rect
            x="13"
            y="0"
            width="2"
            height="1"
            fill={LEFT_PALETTE.wingOuter}
          />
          <rect
            x="13"
            y="1"
            width="1"
            height="1"
            fill={LEFT_PALETTE.wingInner}
          />
        </>
      ) : (
        <>
          {/* Cowlick — diagonal swoop, 2px base tapering to 1px */}
          <rect
            x="10"
            y="0"
            width="2"
            height="1"
            fill={RIGHT_PALETTE.cowlickBase}
          />
          <rect
            x="11"
            y="1"
            width="2"
            height="1"
            fill={RIGHT_PALETTE.cowlickBase}
          />
          <rect
            x="12"
            y="0"
            width="1"
            height="1"
            fill={RIGHT_PALETTE.cowlickTip}
          />
          <rect
            x="13"
            y="0"
            width="1"
            height="1"
            fill={RIGHT_PALETTE.cowlickTip}
          />
          <rect
            x="13"
            y="-1"
            width="1"
            height="1"
            fill={RIGHT_PALETTE.cowlickTip}
          />
        </>
      )}

      {/* Body outline */}
      <rect x="5" y="2" width="8" height="1" fill={p.outline} />
      <rect x="4" y="3" width="1" height="1" fill={p.outline} />
      <rect x="13" y="3" width="1" height="1" fill={p.outline} />
      <rect x="3" y="4" width="1" height="10" fill={p.outline} />
      <rect x="14" y="4" width="1" height="10" fill={p.outline} />
      <rect x="4" y="14" width="1" height="1" fill={p.outline} />
      <rect x="13" y="14" width="1" height="1" fill={p.outline} />
      <rect x="5" y="15" width="8" height="1" fill={p.outline} />

      {/* Body fill */}
      <rect x="5" y="3" width="8" height="1" fill={p.body} />
      <rect x="4" y="4" width="10" height="10" fill={p.body} />
      <rect x="5" y="14" width="8" height="1" fill={p.body} />

      {/* Highlight */}
      <rect x="5" y="4" width="2" height="1" fill={p.highlight} />
      <rect x="5" y="5" width="1" height="1" fill={p.highlight} />

      {/* Eyes */}
      {isBlinking ? (
        <>
          <rect x="6" y="8" width="2" height="1" fill={p.eyeDark} />
          <rect x="10" y="8" width="2" height="1" fill={p.eyeDark} />
        </>
      ) : (
        <>
          <rect x="6" y="7" width="2" height="2" fill={p.eyeDark} />
          <rect x="10" y="7" width="2" height="2" fill={p.eyeDark} />
          <rect x="6" y="7" width="1" height="1" fill={p.eyeShine} />
          <rect x="10" y="7" width="1" height="1" fill={p.eyeShine} />
        </>
      )}

      {/* Cheeks */}
      <rect x="5" y="10" width="2" height="1" fill={p.cheek} />
      <rect x="11" y="10" width="2" height="1" fill={p.cheek} />

      {/* Mouth */}
      {isKissing ? (
        <>
          <rect x="8" y="11" width="2" height="2" fill={p.outline} />
          <rect x="9" y="11" width="1" height="1" fill={p.body} />
        </>
      ) : (
        <>
          <rect x="7" y="12" width="1" height="1" fill={p.outline} />
          <rect x="8" y="13" width="2" height="1" fill={p.outline} />
          <rect x="10" y="12" width="1" height="1" fill={p.outline} />
        </>
      )}

      {/* Arms */}
      <rect x="2" y="10" width="1" height="2" fill={p.body} />
      <rect x="2" y="10" width="1" height="1" fill={p.outline} />
      <rect x="15" y="10" width="1" height="2" fill={p.body} />
      <rect x="15" y="10" width="1" height="1" fill={p.outline} />

      {/* Feet */}
      <rect x="6" y="16" width="2" height="1" fill={p.feet} />
      <rect x="10" y="16" width="2" height="1" fill={p.feet} />

      {/* Left Mochi bow */}
      {side === 'left' && (
        <>
          <rect x="3" y="3" width="1" height="1" fill={LEFT_PALETTE.bow} />
          <rect x="2" y="4" width="1" height="1" fill={LEFT_PALETTE.bow} />
          <rect
            x="3"
            y="4"
            width="1"
            height="1"
            fill={LEFT_PALETTE.bowShadow}
          />
          <rect
            x="4"
            y="3"
            width="1"
            height="2"
            fill={LEFT_PALETTE.bowCenter}
          />
          <rect x="5" y="3" width="1" height="1" fill={LEFT_PALETTE.bow} />
          <rect
            x="5"
            y="4"
            width="1"
            height="1"
            fill={LEFT_PALETTE.bowShadow}
          />
          <rect x="6" y="4" width="1" height="1" fill={LEFT_PALETTE.bow} />
          <rect
            x="3"
            y="5"
            width="1"
            height="1"
            fill={LEFT_PALETTE.bowShadow}
          />
          <rect
            x="5"
            y="5"
            width="1"
            height="1"
            fill={LEFT_PALETTE.bowShadow}
          />
        </>
      )}
    </svg>
  );
}

function PixelHeart({
  travelX,
  travelY,
  style,
  onEnd,
}: {
  travelX: number;
  travelY: number;
  style: React.CSSProperties;
  onEnd: () => void;
}) {
  return (
    <svg
      viewBox="0 0 7 7"
      className="desktop-pet-heart"
      style={
        {
          ...style,
          '--heart-travel-x': `${travelX}px`,
          '--heart-travel-y': `${travelY}px`,
        } as React.CSSProperties
      }
      shapeRendering="crispEdges"
      onAnimationEnd={onEnd}
    >
      <rect x="1" y="0" width="2" height="1" fill="#CC1177" />
      <rect x="4" y="0" width="2" height="1" fill="#CC1177" />
      <rect x="0" y="1" width="1" height="2" fill="#CC1177" />
      <rect x="3" y="1" width="1" height="1" fill="#CC1177" />
      <rect x="6" y="1" width="1" height="2" fill="#CC1177" />
      <rect x="0" y="3" width="1" height="1" fill="#CC1177" />
      <rect x="6" y="3" width="1" height="1" fill="#CC1177" />
      <rect x="1" y="4" width="1" height="1" fill="#CC1177" />
      <rect x="5" y="4" width="1" height="1" fill="#CC1177" />
      <rect x="2" y="5" width="1" height="1" fill="#CC1177" />
      <rect x="4" y="5" width="1" height="1" fill="#CC1177" />
      <rect x="3" y="6" width="1" height="1" fill="#CC1177" />
      <rect x="1" y="1" width="2" height="1" fill="#FF1493" />
      <rect x="4" y="1" width="2" height="1" fill="#FF1493" />
      <rect x="1" y="2" width="5" height="1" fill="#FF1493" />
      <rect x="1" y="3" width="5" height="1" fill="#FF1493" />
      <rect x="2" y="4" width="3" height="1" fill="#FF1493" />
      <rect x="3" y="5" width="1" height="1" fill="#FF1493" />
      <rect x="1" y="1" width="1" height="1" fill="#FF69B4" />
    </svg>
  );
}

interface HeartData {
  id: number;
  startX: number;
  travelX: number;
  travelY: number;
  delay: number;
  duration: number;
  wobble: number;
}

type KissState = 'idle' | 'left-kissing' | 'right-kissing';

export function DesktopPet() {
  const playgroundRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Left Mochi state
  const [leftPos, setLeftPos] = useState({ x: 0, y: 0 });
  const [leftTilt, setLeftTilt] = useState(0);
  const [leftBlinking, setLeftBlinking] = useState(false);
  const [leftBounce, setLeftBounce] = useState(false);
  const leftPctRef = useRef({ x: 0, y: 50 });

  // Right Mochi state
  const [rightPos, setRightPos] = useState({ x: 0, y: 0 });
  const [rightTilt, setRightTilt] = useState(0);
  const [rightBlinking, setRightBlinking] = useState(false);
  const [rightBounce, setRightBounce] = useState(false);
  const rightPctRef = useRef({ x: 95, y: 50 });

  // Shared kiss state
  const [kissState, setKissState] = useState<KissState>('idle');
  const [hearts, setHearts] = useState<HeartData[]>([]);
  const heartIdRef = useRef(0);
  const meetingRef = useRef(false);

  const petSize = useCallback(() => {
    if (typeof window === 'undefined') return { w: 70, h: 70 };
    return window.innerWidth < 768 ? { w: 55, h: 55 } : { w: 70, h: 70 };
  }, []);

  const calcPixelPos = useCallback(
    (xPct: number, yPct: number) => {
      const el = playgroundRef.current;
      if (!el) return { x: 0, y: 0 };
      const { w, h } = petSize();
      const maxX = el.clientWidth - w;
      const maxY = el.clientHeight - h;
      return {
        x: Math.round((xPct / 100) * maxX),
        y: Math.round((yPct / 100) * maxY),
      };
    },
    [petSize],
  );

  useEffect(() => {
    setLeftPos(calcPixelPos(0, 50));
    setRightPos(calcPixelPos(95, 50));
    setMounted(true);
  }, [calcPixelPos]);

  // Left drift: 0-40% X range
  const driftLeft = useCallback(() => {
    const newXPct = Math.random() * 40;
    const newYPct = 20 + Math.random() * 50;
    const dx = newXPct - leftPctRef.current.x;
    const lean = Math.max(-3, Math.min(3, dx * 0.1));
    setLeftTilt(lean);
    setLeftPos(calcPixelPos(newXPct, newYPct));
    leftPctRef.current = { x: newXPct, y: newYPct };
    setTimeout(() => setLeftTilt(0), 1800);
  }, [calcPixelPos]);

  // Right drift: 55-95% X range
  const driftRight = useCallback(() => {
    const newXPct = 55 + Math.random() * 40;
    const newYPct = 20 + Math.random() * 50;
    const dx = newXPct - rightPctRef.current.x;
    const lean = Math.max(-3, Math.min(3, dx * 0.1));
    setRightTilt(lean);
    setRightPos(calcPixelPos(newXPct, newYPct));
    rightPctRef.current = { x: newXPct, y: newYPct };
    setTimeout(() => setRightTilt(0), 1800);
  }, [calcPixelPos]);

  const spawnKissHearts = useCallback(
    (sender: MochiSide) => {
      const el = playgroundRef.current;
      if (!el) return;

      const senderPct =
        sender === 'left' ? leftPctRef.current : rightPctRef.current;
      const receiverPct =
        sender === 'left' ? rightPctRef.current : leftPctRef.current;
      const { w } = petSize();

      const senderPx = calcPixelPos(senderPct.x, senderPct.y);
      const receiverPx = calcPixelPos(receiverPct.x, receiverPct.y);

      const startX = senderPx.x + w / 2;
      const baseTravelX = receiverPx.x + w / 2 - startX;
      const baseTravelY = receiverPx.y - senderPx.y - 30;

      const count = 3 + Math.floor(Math.random() * 3);
      const newHearts: HeartData[] = [];
      for (let i = 0; i < count; i++) {
        const wobble = -10 + Math.random() * 20;
        newHearts.push({
          id: ++heartIdRef.current,
          startX,
          travelX: baseTravelX * (0.6 + Math.random() * 0.4) + wobble,
          travelY: baseTravelY - 20 - Math.random() * 30,
          delay: i * 150,
          duration: 1800 + Math.random() * 600,
          wobble,
        });
      }
      setHearts((prev) => [...prev, ...newHearts]);
    },
    [calcPixelPos, petSize],
  );

  const blowKiss = useCallback(
    (sender: MochiSide) => {
      setKissState(`${sender}-kissing`);
      spawnKissHearts(sender);
      setTimeout(() => setKissState('idle'), 400);
    },
    [spawnKissHearts],
  );

  const removeHeart = useCallback((id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleTap = useCallback(
    (side: MochiSide) => {
      if (side === 'left') {
        setLeftBounce(true);
        setTimeout(() => setLeftBounce(false), 500);
      } else {
        setRightBounce(true);
        setTimeout(() => setRightBounce(false), 500);
      }
      blowKiss(side);
    },
    [blowKiss],
  );

  const spawnMeetHearts = useCallback(() => {
    const el = playgroundRef.current;
    if (!el) return;
    const { w } = petSize();
    const centerX = el.clientWidth / 2;
    const count = 6 + Math.floor(Math.random() * 3);
    const newHearts: HeartData[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      newHearts.push({
        id: ++heartIdRef.current,
        startX: centerX,
        travelX: Math.cos(angle) * (30 + Math.random() * 30),
        travelY: -30 - Math.random() * 50,
        delay: i * 80,
        duration: 1400 + Math.random() * 600,
        wobble: 0,
      });
    }
    setHearts((prev) => [...prev, ...newHearts]);
  }, [petSize]);

  // Meet in the middle every ~15s
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 13000 + Math.random() * 4000;
      return setTimeout(() => {
        if (meetingRef.current) {
          timerId = scheduleNext();
          return;
        }
        meetingRef.current = true;
        const meetY = 30 + Math.random() * 30;
        setLeftPos(calcPixelPos(38, meetY));
        setRightPos(calcPixelPos(55, meetY));
        leftPctRef.current = { x: 38, y: meetY };
        rightPctRef.current = { x: 55, y: meetY };

        // Hearts burst after they arrive
        setTimeout(() => {
          spawnMeetHearts();
          blowKiss('left');
          setTimeout(() => blowKiss('right'), 300);
        }, 1900);

        // Drift apart after the moment
        setTimeout(() => {
          const lx = Math.random() * 30;
          const ly = 20 + Math.random() * 50;
          const rx = 65 + Math.random() * 30;
          const ry = 20 + Math.random() * 50;
          setLeftPos(calcPixelPos(lx, ly));
          setRightPos(calcPixelPos(rx, ry));
          leftPctRef.current = { x: lx, y: ly };
          rightPctRef.current = { x: rx, y: ry };
          meetingRef.current = false;
        }, 4000);

        timerId = scheduleNext();
      }, delay);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [calcPixelPos, spawnMeetHearts, blowKiss]);

  // Left drift timer: 3-5s
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        driftLeft();
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [driftLeft]);

  // Right drift timer: 3-5s (offset start)
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        driftRight();
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = setTimeout(
      () => {
        driftRight();
        timerId = scheduleNext();
      },
      1500 + Math.random() * 1000,
    );
    return () => clearTimeout(timerId);
  }, [driftRight]);

  // Alternating kiss timer: left → right → left...
  useEffect(() => {
    let nextSender: MochiSide = 'left';
    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 1500;
      return setTimeout(() => {
        blowKiss(nextSender);
        nextSender = nextSender === 'left' ? 'right' : 'left';
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = setTimeout(() => {
      blowKiss('left');
      nextSender = 'right';
      timerId = scheduleNext();
    }, 2000);
    return () => clearTimeout(timerId);
  }, [blowKiss]);

  // Left blink: 5-7s
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 2000;
      return setTimeout(() => {
        setLeftBlinking(true);
        setTimeout(() => setLeftBlinking(false), 150);
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, []);

  // Right blink: 4-6s (slightly different cadence)
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 2000;
      return setTimeout(() => {
        setRightBlinking(true);
        setTimeout(() => setRightBlinking(false), 150);
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div
      className="desktop-pet-playground"
      ref={playgroundRef}
      aria-hidden="true"
    >
      {/* Left Mochi */}
      <div
        className="desktop-pet-mover"
        style={
          mounted
            ? {
                transform: `translate(${leftPos.x}px, ${leftPos.y}px)`,
                pointerEvents: 'auto',
              }
            : { transform: 'translate(-80px, 60px)', opacity: 0 }
        }
        onClick={() => handleTap('left')}
      >
        <div
          className="desktop-pet-tilter"
          style={{ transform: `rotate(${leftTilt}deg)` }}
        >
          <div
            className={`desktop-pet-bobber${leftBounce ? ' desktop-pet-bounce' : ''}`}
          >
            <MochiSprite
              side="left"
              isKissing={kissState === 'left-kissing'}
              isBlinking={leftBlinking}
            />
          </div>
        </div>
      </div>

      {/* Right Mochi */}
      <div
        className="desktop-pet-mover"
        style={
          mounted
            ? {
                transform: `translate(${rightPos.x}px, ${rightPos.y}px)`,
                pointerEvents: 'auto',
              }
            : { transform: 'translate(300px, 60px)', opacity: 0 }
        }
        onClick={() => handleTap('right')}
      >
        <div
          className="desktop-pet-tilter"
          style={{ transform: `rotate(${rightTilt}deg)` }}
        >
          <div
            className={`desktop-pet-bobber${rightBounce ? ' desktop-pet-bounce' : ''}`}
          >
            <MochiSprite
              side="right"
              isKissing={kissState === 'right-kissing'}
              isBlinking={rightBlinking}
            />
          </div>
        </div>
      </div>

      {/* Hearts — positioned absolutely within playground */}
      {hearts.map((heart) => (
        <PixelHeart
          key={heart.id}
          travelX={heart.travelX}
          travelY={heart.travelY}
          style={
            {
              '--heart-delay': `${heart.delay}ms`,
              '--heart-duration': `${heart.duration}ms`,
              left: `${heart.startX}px`,
            } as React.CSSProperties
          }
          onEnd={() => removeHeart(heart.id)}
        />
      ))}
    </div>
  );
}
