'use client';

import { CozyRoomScene } from './cozy-room-scene';
import { Win98Shell } from './win98-shell';

interface LoveJarWindowProps {
  messages: string[];
  onShake: () => void;
}

export function LoveJarWindow({ messages, onShake }: LoveJarWindowProps) {
  // TODO: swap these placeholder circles for the real Mochi assets when ready.
  const placeholderMochi = (label: string) => (
    <div
      style={{
        width: 80,
        height: 80,
        background: '#FFB6E1',
        border: '2px solid #000',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontSize: 32,
      }}
    >
      {label}
    </div>
  );

  return (
    <Win98Shell
      messageCount={messages.length}
      mochiLeft={placeholderMochi('L')}
      mochiRight={placeholderMochi('R')}
    >
      <CozyRoomScene messages={messages} onShake={onShake} />
    </Win98Shell>
  );
}
