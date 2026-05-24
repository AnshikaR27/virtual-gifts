'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Jar } from '../jar';
import { loveJarPrompts } from '@/prompts/love-jar';

const HEART_COLORS = [
  '#FFC4D6',
  '#FFD3B6',
  '#E0BBE4',
  '#FFF5BA',
  '#C7E9C0',
  '#FFB5A7',
];

const GENERIC_PATTERNS = [
  /^i love you( so much)?$/i,
  /^you'?re the best$/i,
  /^you mean everything$/i,
  /^you'?re amazing$/i,
  /^i miss you$/i,
  /^you'?re perfect$/i,
  /^i can'?t live without you$/i,
];

const CHEER_MESSAGES = [
  "one down. they're going to keep this forever.",
  'that one was beautiful.',
  "see? you're a natural at this.",
  "they don't know what's coming.",
  'another one for the jar.',
  'you make this look easy.',
  "they're going to read this one twice.",
  "that's the stuff. keep going.",
];

function getCounterMessage(count: number, min: number, max: number): string {
  if (count === 0) return "let's fill this up";
  if (count < min) return CHEER_MESSAGES[count % CHEER_MESSAGES.length];
  if (count === min)
    return "you've hit the minimum. but the magic is in the extras.";
  if (count >= 5 && count < max) return 'okay this is going to wreck them';
  if (count >= max) return "the jar's full. ready when you are";
  return CHEER_MESSAGES[count % CHEER_MESSAGES.length];
}

interface HeartsStepProps {
  recipientName: string;
  hearts: string[];
  onHeartsChange: (hearts: string[]) => void;
  onContinue: () => void;
  maxHearts: number;
  minHearts: number;
}

export function HeartsStep({
  recipientName,
  hearts,
  onHeartsChange,
  onContinue,
  maxHearts,
  minHearts,
}: HeartsStepProps) {
  const [currentText, setCurrentText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showInspiration, setShowInspiration] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allPrompts = useMemo(
    () => [loveJarPrompts.primary, ...loveJarPrompts.alternatives],
    [],
  );
  const currentPrompt = allPrompts[promptIndex % allPrompts.length];

  const isGeneric = useCallback((text: string) => {
    return GENERIC_PATTERNS.some((p) => p.test(text.trim()));
  }, []);

  const charCount = currentText.length;
  const canAdd =
    charCount >= loveJarPrompts.minLength && hearts.length < maxHearts;
  const canContinue = hearts.length >= minHearts;

  // Specificity nudge
  useEffect(() => {
    if (currentText.length >= 10 && isGeneric(currentText)) {
      setShowNudge(true);
    } else {
      setShowNudge(false);
    }
  }, [currentText, isGeneric]);

  // Auto-save to localStorage
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (currentText.trim()) {
        localStorage.setItem(
          'love-jar-draft',
          JSON.stringify({ currentText, hearts }),
        );
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 1500);
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [currentText, hearts]);

  const handleAddHeart = useCallback(() => {
    if (!canAdd) return;
    const trimmed = currentText.trim();
    if (!trimmed) return;

    if (editingIndex !== null) {
      const updated = [...hearts];
      updated[editingIndex] = trimmed;
      onHeartsChange(updated);
      setEditingIndex(null);
    } else {
      onHeartsChange([...hearts, trimmed]);
    }

    setCurrentText('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    setPromptIndex((i) => i + 1);
    textareaRef.current?.focus();
  }, [canAdd, currentText, editingIndex, hearts, onHeartsChange]);

  const handleEditHeart = useCallback(
    (index: number) => {
      setCurrentText(hearts[index]);
      setEditingIndex(index);
      textareaRef.current?.focus();
    },
    [hearts],
  );

  const handleDeleteHeart = useCallback(
    (index: number) => {
      const updated = hearts.filter((_, i) => i !== index);
      onHeartsChange(updated);
      if (editingIndex === index) {
        setEditingIndex(null);
        setCurrentText('');
      }
    },
    [hearts, editingIndex, onHeartsChange],
  );

  const switchPrompt = useCallback(() => {
    setPromptIndex((i) => i + 1);
  }, []);

  return (
    <motion.div
      className="flex min-h-[100dvh] flex-col lg:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* LEFT — Jar visual */}
      <div className="flex flex-col items-center justify-center px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:w-2/5 lg:py-12">
        <div className="w-full max-w-[220px] lg:max-w-[260px]">
          <Jar
            recipientName={recipientName}
            heartCount={hearts.length}
            isShaking={justAdded}
            lowMemory={false}
          />
        </div>

        {/* Counter + cheer message */}
        <motion.div
          className="mt-4 text-center"
          key={hearts.length}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-handwritten text-lg text-[#5C3D2E]">
            {getCounterMessage(hearts.length, minHearts, maxHearts)}
          </p>
          <p className="mt-1 font-body text-xs text-[#A08060]/50">
            {hearts.length} of {maxHearts} hearts
          </p>
        </motion.div>

        {/* Heart thumbnail strip */}
        {hearts.length > 0 && (
          <div className="scrollbar-hide mt-4 flex max-w-full gap-2 overflow-x-auto px-2 pb-2">
            {hearts.map((_, i) => (
              <motion.button
                key={i}
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                  editingIndex === i
                    ? 'ring-2 ring-[#780037] ring-offset-2'
                    : 'hover:scale-110'
                }`}
                style={{ background: HEART_COLORS[i % HEART_COLORS.length] }}
                onClick={() => handleEditHeart(i)}
                onDoubleClick={() => handleDeleteHeart(i)}
                title="Tap to edit, double-tap to delete"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 10 10"
                  fill="white"
                  opacity="0.8"
                >
                  <path d="M5,8.5 C3,6.5 0.5,5 0.5,3 C0.5,1.5 2,0.5 3.5,1.5 C4.2,2 4.7,2.5 5,3 C5.3,2.5 5.8,2 6.5,1.5 C8,0.5 9.5,1.5 9.5,3 C9.5,5 7,6.5 5,8.5 Z" />
                </svg>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — Writing area */}
      <div className="flex flex-1 flex-col px-6 py-8 lg:justify-center lg:py-12 lg:pl-4 lg:pr-12">
        <div className="mx-auto w-full max-w-md">
          {/* Prompt */}
          <div className="mb-4">
            <p className="font-handwritten text-2xl leading-snug text-[#5C3D2E]">
              {currentPrompt}
            </p>
            <button
              onClick={switchPrompt}
              className="mt-2 font-body text-xs text-[#A0845C] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#780037]"
            >
              switch prompt
            </button>
          </div>

          {/* Textarea — notebook paper style */}
          <div className="love-jar-notebook relative rounded-lg border border-[#E8D5C0]/60 bg-[#FFFCF8] p-4 shadow-sm">
            <textarea
              ref={textareaRef}
              value={currentText}
              onChange={(e) =>
                setCurrentText(
                  e.target.value.slice(0, loveJarPrompts.maxLength),
                )
              }
              placeholder="write from the heart..."
              className="love-jar-textarea w-full resize-none bg-transparent font-handwritten text-xl leading-[2.2rem] text-[#4A3520] placeholder:text-[#C4A882]/40 focus:outline-none"
              rows={4}
              maxLength={loveJarPrompts.maxLength}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canAdd) {
                  e.preventDefault();
                  handleAddHeart();
                }
              }}
            />

            {/* Notebook ruled lines */}
            <div
              className="love-jar-ruled-lines pointer-events-none absolute inset-x-4 top-4"
              aria-hidden="true"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-b border-[#E8D5C0]/40"
                  style={{ height: '2.2rem' }}
                />
              ))}
            </div>

            {/* Character counter */}
            <div className="mt-2 flex items-center justify-between">
              <AnimatePresence>
                {savedIndicator && (
                  <motion.span
                    className="font-body text-xs text-[#7CB342]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    saved ✓
                  </motion.span>
                )}
              </AnimatePresence>
              <span
                className={`ml-auto font-body text-xs transition-colors ${
                  charCount >= 30
                    ? 'text-[#7CB342]'
                    : charCount >= loveJarPrompts.minLength
                      ? 'text-[#A08060]/60'
                      : 'text-[#C4A882]/40'
                }`}
              >
                {charCount}/{loveJarPrompts.maxLength}
              </span>
            </div>
          </div>

          {/* Specificity nudge */}
          <AnimatePresence>
            {showNudge && (
              <motion.p
                className="mt-3 rounded-lg bg-[#FFF5BA]/30 px-3 py-2 font-body text-xs text-[#8B6B50]"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                this is sweet — can you make it more specific? one detail nobody
                else would notice
              </motion.p>
            )}
          </AnimatePresence>

          {/* Inspiration button */}
          <button
            onClick={() => setShowInspiration(true)}
            className="mt-3 font-body text-xs text-[#A0845C] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#780037]"
          >
            need ideas? ✨
          </button>

          {/* Add to jar CTA */}
          <motion.button
            onClick={handleAddHeart}
            disabled={!canAdd}
            className="mt-6 w-full rounded-xl bg-[#780037] px-6 py-3.5 font-body text-base font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-md"
            whileTap={canAdd ? { scale: 0.97 } : undefined}
          >
            {editingIndex !== null ? 'update heart ♡' : 'add to jar ♡'}
          </motion.button>

          {/* Microcopy */}
          <p className="mt-2 text-center font-body text-xs text-[#A08060]/50">
            {loveJarPrompts.microcopy}
          </p>

          {/* Continue button */}
          <AnimatePresence>
            {canContinue && (
              <motion.button
                onClick={onContinue}
                className="mt-6 w-full rounded-xl border-2 border-[#780037]/20 bg-white/60 px-6 py-3.5 font-body text-base font-medium text-[#780037] shadow-sm backdrop-blur-sm transition-all hover:border-[#780037]/40 hover:bg-white/80"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                whileTap={{ scale: 0.97 }}
              >
                preview &rarr;
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Inspiration drawer */}
      <AnimatePresence>
        {showInspiration && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/20"
              onClick={() => setShowInspiration(false)}
            />
            <motion.div
              className="relative max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-[#FFFCF8] px-6 pb-8 pt-6 shadow-xl lg:rounded-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-handwritten text-xl text-[#5C3D2E]">
                  inspiration ✨
                </h3>
                <button
                  onClick={() => setShowInspiration(false)}
                  className="font-body text-sm text-[#A08060]"
                >
                  close
                </button>
              </div>
              <p className="mb-4 font-body text-xs text-[#A08060]/70">
                real examples from real people (tap to use as a starting point)
              </p>
              <div className="space-y-3">
                {loveJarPrompts.inspiration.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentText(example);
                      setShowInspiration(false);
                      textareaRef.current?.focus();
                    }}
                    className="w-full rounded-lg border border-[#E8D5C0]/50 bg-white/70 px-4 py-3 text-left font-handwritten text-base text-[#5C3D2E] transition-all hover:border-[#D4B896] hover:bg-white"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
