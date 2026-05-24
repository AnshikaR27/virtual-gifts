'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SetupStep } from '@/gifts/love-jar/creator/setup-step';
import { HeartsStep } from '@/gifts/love-jar/creator/hearts-step';
import { PreviewStep } from '@/gifts/love-jar/creator/preview-step';
import { ShareStep } from '@/gifts/love-jar/creator/share-step';
import { generateShortId } from '@/lib/short-id';

type Step = 'setup' | 'hearts' | 'preview' | 'share';

const STEPS: Step[] = ['setup', 'hearts', 'preview', 'share'];

const FREE_MAX = 3;
const PAID_MAX = 15;
const MIN_HEARTS = 3;

export default function CreateLoveJarPage() {
  const [step, setStep] = useState<Step>('setup');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [hearts, setHearts] = useState<string[]>([]);
  const [isPaid] = useState(true); // TODO: integrate with Razorpay tier check

  const maxHearts = isPaid ? PAID_MAX : FREE_MAX;
  const shortId = useMemo(() => generateShortId(), []);

  const currentStepIndex = STEPS.indexOf(step);

  const handleSetupComplete = useCallback(
    (data: { recipientName: string; senderName: string }) => {
      setRecipientName(data.recipientName);
      setSenderName(data.senderName);
      setStep('hearts');
    },
    [],
  );

  const handleHeartsChange = useCallback((newHearts: string[]) => {
    setHearts(newHearts);
  }, []);

  const handleHeartsContinue = useCallback(() => {
    setStep('preview');
  }, []);

  const handlePreviewBack = useCallback(() => {
    setStep('hearts');
  }, []);

  const handlePreviewConfirm = useCallback(() => {
    // TODO: For paid tier, insert Razorpay step before share
    setStep('share');
  }, []);

  return (
    <div
      className="relative min-h-[100dvh]"
      style={{
        background:
          'linear-gradient(160deg, #FFFDF8 0%, #FDF9F3 40%, #FAF6F0 70%, #F7F2EB 100%)',
      }}
    >
      {/* Progress dots */}
      <div className="sticky top-0 z-40 flex items-center justify-center gap-2 px-4 pb-3 pt-4 backdrop-blur-sm">
        {STEPS.map((s, i) => (
          <motion.div
            key={s}
            className="flex items-center gap-2"
            initial={false}
          >
            <motion.div
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= currentStepIndex ? 'bg-[#780037]' : 'bg-[#E8D5C0]/60'
              }`}
              animate={{
                width: i === currentStepIndex ? 24 : 8,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <SetupStep
            key="setup"
            onComplete={handleSetupComplete}
            initialRecipient={recipientName}
            initialSender={senderName}
          />
        )}
        {step === 'hearts' && (
          <HeartsStep
            key="hearts"
            recipientName={recipientName}
            hearts={hearts}
            onHeartsChange={handleHeartsChange}
            onContinue={handleHeartsContinue}
            maxHearts={maxHearts}
            minHearts={MIN_HEARTS}
          />
        )}
        {step === 'preview' && (
          <PreviewStep
            key="preview"
            recipientName={recipientName}
            messages={hearts}
            onBack={handlePreviewBack}
            onConfirm={handlePreviewConfirm}
          />
        )}
        {step === 'share' && (
          <ShareStep
            key="share"
            recipientName={recipientName}
            senderName={senderName}
            hearts={hearts}
            shortId={shortId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
