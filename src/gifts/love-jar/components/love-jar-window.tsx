'use client';

import { CozyRoomScene } from './cozy-room-scene';

interface LoveJarWindowProps {
  recipientName: string;
  messageCount: number;
  onShake: () => void;
}

export function LoveJarWindow({ messageCount, onShake }: LoveJarWindowProps) {
  return <CozyRoomScene messageCount={messageCount} onShake={onShake} />;
}
