import type { PromptSet } from './types';

export const sorryPuppyPrompts: PromptSet = {
  primary:
    "What exactly did you do wrong? Say it like you're admitting it to their face.",
  alternatives: [
    'What do you wish you could take back, and why?',
    'Tell them what you should have done instead.',
  ],
  microcopy: "The more specific you are, the more it'll mean.",
  inspiration: [
    "I'm sorry I forgot our anniversary. I should have remembered, and I didn't, and that wasn't okay.",
    "I shouldn't have raised my voice. You deserved patience, and I gave you the opposite.",
    "I know I said I'd be there. I wasn't. And I know that hurt more than I want to admit.",
    "I'm sorry I scrolled through my phone when you were trying to tell me something important.",
    "I should have defended you in front of my friends. I froze. That's on me.",
    "I lied about something small and it made you question everything. I'm sorry.",
    "I'm sorry I made you feel like your feelings weren't valid. They always are.",
    'I forgot to pick up the thing you asked me three times. I see you, and I will do better.',
  ],
  minLength: 15,
  maxLength: 200,
};
