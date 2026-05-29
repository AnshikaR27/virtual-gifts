'use client';

import { CozyRoomScene } from './cozy-room-scene';

interface LoveJarWindowProps {
  messages: string[];
  onShake: () => void;
}

export function LoveJarWindow({ messages, onShake }: LoveJarWindowProps) {
  return <CozyRoomScene messages={messages} onShake={onShake} />;
}
