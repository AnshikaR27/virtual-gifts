'use client';

import { useCallback, useEffect, useState } from 'react';
import { GiftFrame, useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import type { ReplayBehavior } from '@/types';
import { useJarState } from './hooks/use-jar-state';
import { useShakeDetector } from './hooks/use-shake-detector';
import { AmbientBackground } from './components/ambient-background';
import { ArrivalPopup } from './components/arrival-popup';
import { ShakePrompt } from './components/shake-prompt';
import { JarIllustrated } from './components/jar-illustrated';
import { HeartNote } from './components/heart-note';
import { MemoryShelf } from './components/memory-shelf';
import { EmptyJarState } from './components/empty-jar-state';

interface LoveJarInteriorProps {
  recipientName: string;
  senderName: string;
  messages: string[];
}

function LoveJarInterior({
  recipientName,
  senderName,
  messages,
}: LoveJarInteriorProps) {
  const { onClimax, trackInteraction } = useGiftContext();
  const { state, dispatch } = useJarState(messages);
  const [popupVisible, setPopupVisible] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  const handleShake = useCallback(() => {
    if (state.phase !== 'idle') return;
    trackInteraction('shake', { heartIndex: state.currentHeart?.id });
    dispatch({ type: 'SHAKE' });
  }, [state.phase, state.currentHeart, trackInteraction, dispatch]);

  const { energy, requestPermission, needsPermission } =
    useShakeDetector(handleShake);

  const handleOpenPopup = useCallback(async () => {
    if (needsPermission) {
      await requestPermission();
    }
    setPopupVisible(false);
    trackInteraction('popup_opened');
  }, [needsPermission, requestPermission, trackInteraction]);

  const handlePopupExitComplete = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleKeep = useCallback(() => {
    trackInteraction('keep_note', { noteId: state.currentHeart?.id });
    dispatch({ type: 'KEEP' });
    dispatch({ type: 'KEEP_COMPLETE' });
  }, [state.currentHeart, trackInteraction, dispatch]);

  const handleReturn = useCallback(() => {
    trackInteraction('return_note', { noteId: state.currentHeart?.id });
    dispatch({ type: 'RETURN' });
    dispatch({ type: 'RETURN_COMPLETE' });
  }, [state.currentHeart, trackInteraction, dispatch]);

  useEffect(() => {
    if (state.phase === 'empty') onClimax();
  }, [state.phase, onClimax]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <ShakePrompt
          energy={energy}
          visible={state.phase === 'idle' && sceneReady}
        />

        <JarIllustrated
          recipientName={recipientName}
          hearts={state.unreadHearts}
          energy={energy}
          phase={state.phase}
          onShake={handleShake}
        />

        <div
          className="mt-4 text-center transition-opacity duration-[400ms]"
          style={{ opacity: sceneReady ? 1 : 0 }}
        >
          <p
            className="text-[12px] text-[#A08060]/60"
            style={{ fontFamily: 'Tahoma, sans-serif' }}
          >
            {state.unreadHearts.length} of {state.totalCount} left
          </p>
        </div>
      </div>

      <div
        className="transition-opacity duration-[400ms]"
        style={{ opacity: sceneReady ? 1 : 0 }}
      >
        <MemoryShelf notes={state.keptNotes} />
      </div>

      <HeartNote
        message={state.currentHeart?.message}
        visible={state.phase === 'showing'}
        noteIndex={state.currentHeart?.id ?? 0}
        onReturn={handleReturn}
        onKeep={handleKeep}
      />

      {state.phase === 'empty' && <EmptyJarState />}

      <ArrivalPopup
        recipientName={recipientName}
        messageCount={messages.length}
        onOpen={handleOpenPopup}
        onExitComplete={handlePopupExitComplete}
        visible={popupVisible}
      />
    </div>
  );
}

interface LoveJarProps {
  gift: GiftData;
  replayBehavior: ReplayBehavior;
}

export default function LoveJar({ gift, replayBehavior }: LoveJarProps) {
  const content = gift.contentJsonb as { messages?: string[] };
  const messages = content.messages ?? [];

  return (
    <GiftFrame gift={gift} replayBehavior={replayBehavior}>
      <LoveJarInterior
        recipientName={gift.recipientName}
        senderName={gift.senderName ?? 'Someone'}
        messages={messages}
      />
    </GiftFrame>
  );
}
