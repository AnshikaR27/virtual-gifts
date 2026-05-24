'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SetupStepProps {
  onComplete: (data: { recipientName: string; senderName: string }) => void;
  initialRecipient?: string;
  initialSender?: string;
}

export function SetupStep({
  onComplete,
  initialRecipient = '',
  initialSender = '',
}: SetupStepProps) {
  const [recipientName, setRecipientName] = useState(initialRecipient);
  const [senderName, setSenderName] = useState(initialSender);
  const [touched, setTouched] = useState({ recipient: false, sender: false });

  const canContinue =
    recipientName.trim().length > 0 && senderName.trim().length > 0;

  const handleSubmit = () => {
    if (!canContinue) {
      setTouched({ recipient: true, sender: true });
      return;
    }
    onComplete({
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
    });
  };

  return (
    <motion.div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header with tiny jar illustration */}
      <div className="mb-10 flex flex-col items-center">
        <motion.svg
          width="64"
          height="80"
          viewBox="0 0 100 140"
          fill="none"
          className="mb-4 opacity-70"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Simplified empty jar */}
          <path
            d="M22,38 C20,40 18,50 18,65 C18,95 20,115 22,120 C24,125 30,128 50,128 C70,128 76,125 78,120 C80,115 82,95 82,65 C82,50 80,40 78,38 Z"
            fill="rgba(200,225,240,0.2)"
            stroke="rgba(150,190,215,0.4)"
            strokeWidth="1"
          />
          <path
            d="M26,45 C24,55 23,70 24,95 C24,105 25,112 26,116"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x="30"
            y="30"
            width="40"
            height="10"
            rx="1"
            fill="rgba(200,225,240,0.15)"
            stroke="rgba(150,190,215,0.3)"
            strokeWidth="0.5"
          />
          <rect
            x="26"
            y="22"
            width="48"
            height="10"
            rx="3"
            fill="#E85555"
            opacity="0.7"
          />
          {Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x={26 + i * 8}
              y={22}
              width="4"
              height="10"
              fill="rgba(255,255,255,0.35)"
            />
          ))}
        </motion.svg>

        <motion.h1
          className="font-handwritten text-3xl text-[#5C3D2E]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          let&apos;s fill a jar with love
        </motion.h1>
        <motion.p
          className="mt-2 font-body text-sm text-[#8B6B50]/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          first, a couple of quick things
        </motion.p>
      </div>

      {/* Form */}
      <motion.div
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {/* Recipient name */}
        <div className="relative">
          <label className="mb-1 block font-handwritten text-lg text-[#7A5A42]">
            their name
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, recipient: true }))}
            placeholder="the lucky one"
            className="love-jar-input w-full border-0 border-b-[1.5px] border-[#D4B896]/50 bg-transparent px-0 pb-2 font-handwritten text-xl text-[#4A3520] placeholder:text-[#C4A882]/50 focus:border-[#A0845C] focus:outline-none"
            maxLength={30}
            autoComplete="off"
          />
          <p className="mt-1.5 font-body text-xs text-[#A08060]/60">
            this goes on the jar&apos;s label
          </p>
          {touched.recipient && !recipientName.trim() && (
            <motion.p
              className="mt-1 font-body text-xs text-[#C74B50]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              tiny one — they need a name
            </motion.p>
          )}
        </div>

        {/* Sender name */}
        <div className="relative">
          <label className="mb-1 block font-handwritten text-lg text-[#7A5A42]">
            your name
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, sender: true }))}
            placeholder="the one who made it"
            className="love-jar-input w-full border-0 border-b-[1.5px] border-[#D4B896]/50 bg-transparent px-0 pb-2 font-handwritten text-xl text-[#4A3520] placeholder:text-[#C4A882]/50 focus:border-[#A0845C] focus:outline-none"
            maxLength={30}
            autoComplete="off"
          />
          <p className="mt-1.5 font-body text-xs text-[#A08060]/60">
            so they know who made it
          </p>
          {touched.sender && !senderName.trim() && (
            <motion.p
              className="mt-1 font-body text-xs text-[#C74B50]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              they&apos;ll want to know it&apos;s from you
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Reassurance */}
      <motion.p
        className="mt-6 font-handwritten text-sm text-[#A08060]/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        you can edit anything later
      </motion.p>

      {/* CTA */}
      <motion.button
        onClick={handleSubmit}
        className="mt-8 w-full max-w-sm rounded-xl bg-[#780037] px-6 py-4 font-body text-base font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        disabled={!canContinue}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        whileTap={{ scale: 0.98 }}
      >
        start writing &rarr;
      </motion.button>
    </motion.div>
  );
}
