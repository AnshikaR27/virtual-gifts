'use client';

interface HeartNoteProps {
  message: string | undefined;
  visible: boolean;
  noteIndex: number;
  onReturn: () => void;
  onKeep: () => void;
}

export function HeartNote({
  message,
  visible,
  noteIndex,
  onReturn,
  onKeep,
}: HeartNoteProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="love-jar-note-paper relative rounded-md px-6 py-7"
        style={{
          background: '#FFFCF6',
          boxShadow: '0 12px 28px rgba(120,0,55,0.25)',
        }}
      >
        <div className="love-jar-torn-edge-top" />
        <p className="text-center font-handwritten text-[22px] leading-[1.35] text-[#3D2817]">
          {message}
        </p>
        <p
          className="mt-5 text-center text-[10px] lowercase text-[#A08060]/50"
          style={{ fontFamily: 'Tahoma, sans-serif' }}
        >
          stub — buttons coming in Phase 6
        </p>
      </div>
    </div>
  );
}
