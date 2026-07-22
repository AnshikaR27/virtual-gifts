// Doodle catalog — a labelled grid of every doodle in the registry, so the
// doodle-per-line set can be eyeballed on a phone. Dev-only browsing aid.
import Image from 'next/image';
import { DOODLES } from '@/gifts/love-receipt/love-receipt-doodles';

export const dynamic = 'force-dynamic';

export default function DoodleCatalog() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f1ea',
        padding: '20px 14px 60px',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <h1 style={{ fontSize: 18, margin: '0 0 4px', color: '#1a1a1a' }}>
        Doodle catalog
      </h1>
      <p style={{ fontSize: 12, color: '#666', margin: '0 0 18px' }}>
        {DOODLES.length} doodles. Tap to zoom; names are how we’ll refer to
        them.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 12,
        }}
      >
        {DOODLES.map((d) => (
          <div
            key={d.id}
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={d.src}
                alt={d.id}
                width={84}
                height={84}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <code
              style={{
                fontSize: 10.5,
                color: '#333',
                textAlign: 'center',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {d.id}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
