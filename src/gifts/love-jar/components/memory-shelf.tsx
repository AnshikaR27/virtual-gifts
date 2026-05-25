'use client';

import type { Heart } from '../hooks/use-jar-state';

interface MemoryShelfProps {
  notes: Heart[];
}

export function MemoryShelf({ notes }: MemoryShelfProps) {
  if (notes.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 px-4 pb-3">
      <div className="flex items-end gap-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="h-12 w-10 rounded-sm"
            style={{
              background: '#FFFCF6',
              border: '1px solid rgba(160,128,96,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
