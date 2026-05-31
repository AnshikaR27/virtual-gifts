'use client';

import { MochiSprite } from '@/components/shared/craft-elements';
import { CozyRoomScene } from './cozy-room-scene';
import { Win98Shell } from './win98-shell';

interface LoveJarWindowProps {
  messages: string[];
  onShake: () => void;
}

export function LoveJarWindow({ messages, onShake }: LoveJarWindowProps) {
  // The two Mochis perch close together on the title bar, each leaning toward
  // the other with a permanent kiss pose. The drifting hearts (toward each
  // other) are driven by CSS in the perch wrappers (see win98-shell + globals).
  const mochi = (side: 'left' | 'right') => (
    <div
      style={{
        // Lean in toward the partner: left tips right, right tips left.
        transform: `rotate(${side === 'left' ? 8 : -8}deg)`,
        transformOrigin: 'bottom center',
      }}
    >
      <MochiSprite side={side} isKissing isBlinking={false} />
    </div>
  );

  return (
    <Win98Shell
      messageCount={messages.length}
      mochiLeft={mochi('left')}
      mochiRight={mochi('right')}
    >
      <CozyRoomScene messages={messages} onShake={onShake} />
    </Win98Shell>
  );
}
