'use client';

interface CozyRoomSceneProps {
  messageCount: number;
  onShake: () => void;
}

export function CozyRoomScene({ messageCount, onShake }: CozyRoomSceneProps) {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#2a1a3a]">
      {/* Scene container — portrait aspect, capped width on desktop */}
      <div
        className="relative h-full w-full max-w-[600px]"
        style={{ aspectRatio: '3 / 4' }}
      >
        {/* Background image — full bleed, pixelated */}
        <img
          src="/images/love-jar-room.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />

        {/* Jar placeholder — sits on the cream mat */}
        <div
          className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded border-2 border-dashed"
          style={{
            bottom: '18%',
            width: 100,
            height: 130,
            borderColor: 'rgba(120, 80, 50, 0.45)',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            className="select-none whitespace-pre-wrap text-center font-pixel text-[12px] leading-snug"
            style={{ color: 'rgba(120, 80, 50, 0.6)' }}
          >
            {'[ jar\ngoes\nhere ]'}
          </span>
        </div>

        {/* Bottom UI — counter + button, over the desk foreground */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-4 pt-2">
          {/* Message counter */}
          <p
            className="select-none font-pixel text-[16px] tracking-wide"
            style={{
              color: 'rgba(90, 60, 35, 0.85)',
              textShadow: '0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            &#9829; {messageCount} messages inside &#9829;
          </p>

          {/* Shake button — soft pink pixel style */}
          <button
            className="select-none font-pixel text-[17px] tracking-wide text-white"
            style={{
              background: 'linear-gradient(180deg, #ff8fbf, #e8609a)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 4,
              padding: '10px 28px',
              minHeight: 48,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              boxShadow:
                '0 2px 8px rgba(200, 60, 120, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              cursor: 'pointer',
            }}
            onClick={onShake}
          >
            SHAKE THE JAR &#9829;
          </button>

          {/* Mobile hint */}
          <p
            className="select-none font-pixel text-[12px]"
            style={{
              color: 'rgba(90, 60, 35, 0.5)',
              textShadow: '0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            or shake your phone!
          </p>
        </div>
      </div>
    </div>
  );
}
