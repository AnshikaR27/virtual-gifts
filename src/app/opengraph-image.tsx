import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HoneyHearts — Craft Unforgettable Interactive Surprises';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background:
          'linear-gradient(135deg, #F1F3FF 0%, #F9F9FF 40%, #FDD0EA 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: '#780037',
          letterSpacing: '-0.02em',
        }}
      >
        HoneyHearts
      </div>
      <div
        style={{
          fontSize: 32,
          color: '#141B2B',
          marginTop: 20,
          maxWidth: 800,
          textAlign: 'center' as const,
        }}
      >
        Craft unforgettable interactive surprises
      </div>
      <div style={{ fontSize: 20, color: '#574146', marginTop: 12 }}>
        87 interactive digital gifts · Pick, personalize, send via WhatsApp
      </div>
    </div>,
    { ...size },
  );
}
