'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GiftFrame } from '@/components/gift-frame/gift-frame';

const LoveJar = dynamic(
  () => import('../index').then((m) => ({ default: m.LoveJar })),
  { ssr: false },
);

interface PreviewStepProps {
  recipientName: string;
  messages: string[];
  onBack: () => void;
  onConfirm: () => void;
}

export function PreviewStep({
  recipientName,
  messages,
  onBack,
  onConfirm,
}: PreviewStepProps) {
  const previewGift = {
    id: 'preview',
    shortId: 'preview',
    slug: 'love-jar',
    senderName: null,
    recipientName,
    contentJsonb: { messages },
    paid: true,
  };

  return (
    <motion.div
      className="flex min-h-[100dvh] flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col items-center px-6 pb-4 pt-8">
        <motion.p
          className="font-handwritten text-xl text-[#5C3D2E]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          this is exactly what {recipientName} will see 👀
        </motion.p>
        <p className="mt-1 font-body text-xs text-[#A08060]/60">
          tap the jar to test it out
        </p>
      </div>

      {/* Preview container */}
      <div className="relative mx-auto w-full max-w-sm flex-1 overflow-hidden rounded-2xl border border-[#E8D5C0]/40 shadow-lg">
        <GiftFrame gift={previewGift} replayBehavior="replayable">
          <LoveJar recipientName={recipientName} messages={messages} />
        </GiftFrame>
      </div>

      {/* Action buttons */}
      <motion.div
        className="flex items-center gap-3 px-6 pb-8 pt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border-2 border-[#E8D5C0]/60 bg-white/60 px-4 py-3.5 font-body text-sm font-medium text-[#7A5A42] transition-all hover:border-[#D4B896] hover:bg-white/80"
        >
          edit hearts
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-[#780037] px-4 py-3.5 font-body text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        >
          looks perfect &rarr;
        </button>
      </motion.div>
    </motion.div>
  );
}
