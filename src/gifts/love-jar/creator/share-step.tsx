'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Jar } from '../jar';
import { APP_URL } from '@/lib/constants';

interface ShareStepProps {
  recipientName: string;
  senderName: string;
  hearts: string[];
  shortId: string;
}

export function ShareStep({
  recipientName,
  senderName,
  hearts,
  shortId,
}: ShareStepProps) {
  const [copied, setCopied] = useState(false);

  const giftUrl = `${APP_URL}/g/${shortId}`;
  const whatsappMessage = encodeURIComponent(
    `hey, i made you something 🫙 ${giftUrl}`,
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = giftUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [giftUrl]);

  return (
    <motion.div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Celebration header */}
      <motion.h1
        className="mb-2 font-handwritten text-3xl text-[#5C3D2E]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        your jar is ready
      </motion.h1>
      <motion.p
        className="mb-8 font-body text-sm text-[#A08060]/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        from {senderName}, for {recipientName}
      </motion.p>

      {/* Jar visual */}
      <motion.div
        className="mb-8 w-full max-w-[200px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <Jar
          recipientName={recipientName}
          heartCount={hearts.length}
          isShaking={false}
          lowMemory={false}
        />
      </motion.div>

      {/* Link card */}
      <motion.div
        className="mb-6 w-full max-w-sm overflow-hidden rounded-xl border border-[#E8D5C0]/50 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="mb-2 font-body text-xs text-[#A08060]/60">
          their gift link
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-[#FFF8F0] px-3 py-2 font-body text-sm text-[#5C3D2E]">
            {giftUrl}
          </code>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 rounded-lg bg-[#F5EDE6] px-3 py-2 font-body text-xs font-medium text-[#7A5A42] transition-colors hover:bg-[#EDE3DA]"
          >
            {copied ? 'copied!' : 'copy'}
          </button>
        </div>
      </motion.div>

      {/* Primary CTA — WhatsApp */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-3 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-body text-base font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.97 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        send via WhatsApp
      </motion.a>

      {/* Secondary actions */}
      <motion.div
        className="flex w-full max-w-sm gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <button
          onClick={handleCopy}
          className="flex-1 rounded-xl border border-[#E8D5C0]/60 bg-white/60 px-4 py-3 font-body text-xs font-medium text-[#7A5A42] transition-all hover:bg-white/80"
        >
          copy link
        </button>
        <button
          className="flex-1 rounded-xl border border-[#E8D5C0]/60 bg-white/60 px-4 py-3 font-body text-xs font-medium text-[#7A5A42] transition-all hover:bg-white/80"
          title="Coming soon"
        >
          QR code
        </button>
        <button
          className="flex-1 rounded-xl border border-[#E8D5C0]/60 bg-white/60 px-4 py-3 font-body text-xs font-medium text-[#7A5A42] transition-all hover:bg-white/80"
          title="Coming soon"
        >
          schedule
        </button>
      </motion.div>

      {/* Final reassurance */}
      <motion.p
        className="mt-8 font-handwritten text-sm text-[#A08060]/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        ✨ you&apos;ll get a notification when they open it
      </motion.p>
    </motion.div>
  );
}
