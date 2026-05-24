import type { PromptSet } from './types';

export const loveJarPrompts: PromptSet = {
  primary: 'Tell them something small they do that you secretly love.',
  alternatives: [
    'What habit of theirs used to annoy you but now you find adorable?',
    "What's something they don't know you noticed?",
    'Describe a tiny moment you replay in your head.',
  ],
  microcopy: 'the more specific you are, the harder they’ll cry 😊',
  inspiration: [
    'The way you hum while making tea without realizing it.',
    'How you always save the last bite for me even when you’re still hungry.',
    'The little sigh you do right before you fall asleep.',
    'You rearrange my shoes by the door without saying anything.',
    'That half-smile you get when you’re reading something good.',
    'How your voice gets softer when you talk to animals.',
    'The way you squeeze my hand three times. I know what it means.',
    'You always notice when I’ve had a bad day before I say anything.',
    'How you put your cold feet on me in winter like I’m your personal heater.',
    'The look you give me across a room full of people, like it’s only us.',
  ],
  minLength: 15,
  maxLength: 180,
};
