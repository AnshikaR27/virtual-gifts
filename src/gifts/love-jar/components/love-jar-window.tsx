'use client';

import { CozyRoomScene } from './cozy-room-scene';
import { Win98Shell } from './win98-shell';

interface LoveJarWindowProps {
  messages: string[];
  onShake: () => void;
}

export function LoveJarWindow({ messages, onShake }: LoveJarWindowProps) {
  return (
    <Win98Shell messageCount={messages.length}>
      <CozyRoomScene messages={messages} onShake={onShake} />
    </Win98Shell>
  );
}
