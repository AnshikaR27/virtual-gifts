'use client';

import { Children, type ReactNode } from 'react';

/**
 * <MultiStepForm> — thin, controlled step switcher. The parent owns step state
 * (a useReducer per gift) and passes `step` (1-indexed); only that step's child
 * renders. Back/Next buttons live inside each step because labels differ per
 * gift ("Next ▶", "Wrap it ▶", "Send 💌"). Reused by every multi-step sender.
 */

interface MultiStepFormProps {
  /** 1-indexed active step. */
  step: number;
  /** One node per step, in order. */
  children: ReactNode;
}

export function MultiStepForm({ step, children }: MultiStepFormProps) {
  const steps = Children.toArray(children);
  const index = Math.min(Math.max(step, 1), steps.length) - 1;
  return <>{steps[index] ?? null}</>;
}
