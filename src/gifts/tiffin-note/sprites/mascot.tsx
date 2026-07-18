import type { CSSProperties } from 'react';

/**
 * <PinkBlobMascot> — the little pink kitchen buddy who greets the receiver.
 * "idle" and "waving" (right arm raised) variants. Pixel art, crispEdges.
 */

interface MascotProps {
  waving?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const BODY = '#ffb8c8';
const EAR_IN = '#ff8fb1';
const CHEEK = '#ff7ba1';
const INK = '#2a2540';

export function PinkBlobMascot({
  waving = false,
  size = 44,
  className,
  style,
}: MascotProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      {/* antennae / ears */}
      <rect x="6" y="2" width="4" height="6" fill={BODY} />
      <rect x="22" y="2" width="4" height="6" fill={BODY} />
      <rect x="7" y="3" width="2" height="3" fill={EAR_IN} />
      <rect x="23" y="3" width="2" height="3" fill={EAR_IN} />

      {/* body */}
      <rect x="4" y="8" width="24" height="20" fill={BODY} />

      {/* left arm */}
      <rect x="2" y="12" width="2" height="12" fill={BODY} />
      {/* right arm — raised when waving */}
      {waving ? (
        <>
          <rect x="28" y="4" width="2" height="10" fill={BODY} />
          <rect x="27" y="3" width="3" height="2" fill={BODY} />
        </>
      ) : (
        <rect x="28" y="12" width="2" height="12" fill={BODY} />
      )}

      {/* eyes */}
      <rect x="10" y="14" width="2" height="3" fill={INK} />
      <rect x="20" y="14" width="2" height="3" fill={INK} />

      {/* cheeks */}
      <rect x="7" y="19" width="3" height="2" fill={CHEEK} />
      <rect x="22" y="19" width="3" height="2" fill={CHEEK} />

      {/* smile */}
      <rect x="13" y="22" width="6" height="1" fill={INK} />
      <rect x="13" y="23" width="1" height="1" fill={INK} />
      <rect x="18" y="23" width="1" height="1" fill={INK} />
    </svg>
  );
}
