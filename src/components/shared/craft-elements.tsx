'use client';

export type MochiSide = 'left' | 'right';

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

export const LEFT_PALETTE: LeftPalette = {
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

export const RIGHT_PALETTE: RightPalette = {
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

export function MochiSprite({
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

      <rect x="5" y="2" width="8" height="1" fill={p.outline} />
      <rect x="4" y="3" width="1" height="1" fill={p.outline} />
      <rect x="13" y="3" width="1" height="1" fill={p.outline} />
      <rect x="3" y="4" width="1" height="10" fill={p.outline} />
      <rect x="14" y="4" width="1" height="10" fill={p.outline} />
      <rect x="4" y="14" width="1" height="1" fill={p.outline} />
      <rect x="13" y="14" width="1" height="1" fill={p.outline} />
      <rect x="5" y="15" width="8" height="1" fill={p.outline} />

      <rect x="5" y="3" width="8" height="1" fill={p.body} />
      <rect x="4" y="4" width="10" height="10" fill={p.body} />
      <rect x="5" y="14" width="8" height="1" fill={p.body} />

      <rect x="5" y="4" width="2" height="1" fill={p.highlight} />
      <rect x="5" y="5" width="1" height="1" fill={p.highlight} />

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

      <rect x="5" y="10" width="2" height="1" fill={p.cheek} />
      <rect x="11" y="10" width="2" height="1" fill={p.cheek} />

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

      <rect x="2" y="10" width="1" height="2" fill={p.body} />
      <rect x="2" y="10" width="1" height="1" fill={p.outline} />
      <rect x="15" y="10" width="1" height="2" fill={p.body} />
      <rect x="15" y="10" width="1" height="1" fill={p.outline} />

      <rect x="6" y="16" width="2" height="1" fill={p.feet} />
      <rect x="10" y="16" width="2" height="1" fill={p.feet} />

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

export function CrochetRose() {
  return (
    <svg
      className="garland-rosette"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFC0CB"
        stroke="#F0AEBB"
        strokeWidth="0.6"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFB8C4"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(72 11 11)"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFC0CB"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(144 11 11)"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFB8C4"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(216 11 11)"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFC0CB"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(288 11 11)"
      />
      <circle
        cx="11"
        cy="11"
        r="3"
        fill="#FFAEC9"
        stroke="#E89AB0"
        strokeWidth="0.5"
      />
      <path
        d="M11,9.5 Q12.5,10.5 12,11.5 Q11,12.5 10,11.5 Q9.5,10.5 11,9.5"
        fill="#FF98B5"
        opacity="0.5"
      />
    </svg>
  );
}

export function GarlandLeaf({
  flip = false,
  dark = false,
}: {
  flip?: boolean;
  dark?: boolean;
}) {
  return (
    <svg
      className="garland-leaf"
      viewBox="0 0 14 8"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d="M1,4 Q4,0.5 7,0.5 Q10,0.5 13,4 Q10,7.5 7,7.5 Q4,7.5 1,4Z"
        fill={dark ? '#7DA178' : '#8B9F80'}
        stroke={dark ? '#6B9068' : '#7A8E70'}
        strokeWidth="0.5"
      />
      <path
        d="M2,4 Q7,3.5 12,4"
        stroke={dark ? '#6B9068' : '#7A8E70'}
        strokeWidth="0.4"
        fill="none"
      />
    </svg>
  );
}
