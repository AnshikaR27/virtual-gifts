'use client';

import { LoveJar } from '@/gifts/love-jar';
import { GiftFrame } from '@/components/gift-frame/gift-frame';

const PREVIEW_MESSAGES = [
  'The way you hum while making tea without realizing it.',
  "How you always save the last bite for me even when you're still hungry.",
  'The little sigh you do right before you fall asleep.',
  'You rearrange my shoes by the door without saying anything.',
  "That half-smile you get when you're reading something good.",
  'How your voice gets softer when you talk to animals.',
  'The way you squeeze my hand three times. I know what it means.',
  "You always notice when I've had a bad day before I say anything.",
  "How you put your cold feet on me in winter like I'm your personal heater.",
  "The look you give me across a room full of people, like it's only us.",
];

const PREVIEW_GIFT = {
  id: 'preview-love-jar',
  shortId: 'preview',
  slug: 'love-jar',
  senderName: 'You',
  recipientName: 'Sunshine',
  contentJsonb: { messages: PREVIEW_MESSAGES },
  paid: true,
};

export function LoveJarPreview() {
  return (
    <GiftFrame gift={PREVIEW_GIFT} replayBehavior="replayable">
      <LoveJar recipientName="Sunshine" messages={PREVIEW_MESSAGES} />
    </GiftFrame>
  );
}
