import { ImageResponse } from 'next/og';
import { BRAND_NAME } from '@/lib/constants';

export const runtime = 'edge';
export const alt = `${BRAND_NAME} Gift`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background:
          'linear-gradient(135deg, #FEF3E2 0%, #FFFBF5 50%, #FCE7F3 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, color: '#B45309' }}>
        {BRAND_NAME}
      </div>
      <div style={{ fontSize: 32, color: '#78716C', marginTop: 16 }}>
        Someone made something special for you...
      </div>
    </div>,
    { ...size },
  );
}
