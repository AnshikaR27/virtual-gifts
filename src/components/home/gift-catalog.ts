export interface GiftItem {
  name: string;
  slug: string;
  emoji: string;
  badge: string;
  description: string;
}

export const allGifts: GiftItem[] = [
  // Quick & Sweet (Free)
  {
    name: 'Sorry Puppy',
    slug: 'sorry-puppy',
    emoji: '🐶',
    badge: 'Free',
    description: 'A sad puppy in the rain. Your taps clear the sky.',
  },
  {
    name: 'Miss You',
    slug: 'miss-you',
    emoji: '💌',
    badge: 'Free',
    description: 'A heartfelt miss-you message that tugs at heartstrings.',
  },
  {
    name: 'Good Morning',
    slug: 'good-morning',
    emoji: '🌅',
    badge: 'Free',
    description: 'Start their day with a warm sunrise greeting.',
  },
  {
    name: 'Just Because',
    slug: 'just-because',
    emoji: '🎀',
    badge: 'Free',
    description: 'No occasion needed — just pure love.',
  },
  {
    name: 'Cheer Up',
    slug: 'cheer-up',
    emoji: '🌈',
    badge: 'Free',
    description: 'A rainbow of encouragement to brighten their day.',
  },

  // Make Them Melt (₹49)
  {
    name: 'Love Jar',
    slug: 'love-jar',
    emoji: '🫙',
    badge: '₹49',
    description: "Shake to pull random love notes they'll cry over.",
  },
  {
    name: 'Wishing Dandelion',
    slug: 'wishing-dandelion',
    emoji: '🌼',
    badge: '₹49',
    description: 'Blow to scatter seeds carrying your wishes.',
  },
  {
    name: 'Origami Unfold',
    slug: 'origami-unfold',
    emoji: '🦢',
    badge: '₹49',
    description: 'Watch delicate paper unfold into a love message.',
  },
  {
    name: 'Snow Globe',
    slug: 'snow-globe',
    emoji: '❄️',
    badge: '₹49',
    description: 'Shake to reveal a snowy memory inside.',
  },
  {
    name: 'Star Wish',
    slug: 'star-wish',
    emoji: '⭐',
    badge: '₹49',
    description: 'Catch a falling star and make a wish together.',
  },

  // Wildcard (₹49)
  {
    name: 'Spotify Wrapped',
    slug: 'spotify-wrapped',
    emoji: '🎵',
    badge: '₹49',
    description: 'Their relationship stats, Wrapped-style.',
  },
  {
    name: 'Love Receipt',
    slug: 'love-receipt',
    emoji: '🧾',
    badge: '₹49',
    description: 'An itemized receipt of everything they mean to you.',
  },
  {
    name: 'Loading Screen of Love',
    slug: 'loading-screen-of-love',
    emoji: '⏳',
    badge: '₹49',
    description: 'A fake loading screen with the sweetest progress updates.',
  },
  {
    name: 'Reverse Love Letter',
    slug: 'reverse-love-letter',
    emoji: '💌',
    badge: '₹49',
    description: 'Starts mean, ends heart-melting — the ultimate plot twist.',
  },
  {
    name: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    emoji: '📜',
    badge: '₹49',
    description: 'Legal-style terms for loving you forever.',
  },
  {
    name: 'Rate My Partner',
    slug: 'rate-my-partner',
    emoji: '⭐',
    badge: '₹49',
    description: 'A 5-star review of your significant other.',
  },
  {
    name: 'Villain Origin Story',
    slug: 'villain-origin-story',
    emoji: '🦹',
    badge: '₹49',
    description: 'Their villain arc started when you smiled at them.',
  },
  {
    name: 'Unsubscribe',
    slug: 'unsubscribe',
    emoji: '📧',
    badge: '₹49',
    description: "Try to unsubscribe from loving them. Spoiler: you can't.",
  },
  {
    name: 'Ctrl+Z Fights',
    slug: 'ctrl-z-fights',
    emoji: '⌨️',
    badge: '₹49',
    description: 'Undo every fight with a Ctrl+Z.',
  },
  {
    name: 'Crime Board',
    slug: 'crime-board',
    emoji: '🔍',
    badge: '₹49',
    description: 'A conspiracy board proving they stole your heart.',
  },

  // Play Together
  {
    name: 'Catch My Love',
    slug: 'catch-my-love',
    emoji: '💘',
    badge: 'Free',
    description: 'Catch falling hearts in a mini love game.',
  },
  {
    name: 'Love Lock Bridge',
    slug: 'love-lock-bridge',
    emoji: '🔐',
    badge: '₹49',
    description: 'Lock your love and throw away the key together.',
  },
  {
    name: 'Spin the Wheel',
    slug: 'spin-the-wheel',
    emoji: '🎡',
    badge: 'Free',
    description: 'Spin to pick your next date activity.',
  },
  {
    name: 'Treasure Map',
    slug: 'treasure-map',
    emoji: '🗺️',
    badge: 'Free',
    description: 'Follow clues to find hidden love messages.',
  },

  // For The Long Run
  {
    name: '365 Jar',
    slug: '365-jar',
    emoji: '📅',
    badge: '₹149',
    description: 'A love note for every day of the year.',
  },
  {
    name: 'Growing Garden',
    slug: 'growing-garden',
    emoji: '🌱',
    badge: '₹149',
    description: 'Plant and grow your love garden over time.',
  },
  {
    name: 'Our Playlist',
    slug: 'our-playlist',
    emoji: '🎶',
    badge: '₹49',
    description: 'A shared playlist that tells your story.',
  },

  // Additional gifts referenced in occasion mapping
  {
    name: 'The Proposal',
    slug: 'the-proposal',
    emoji: '💍',
    badge: '₹49',
    description: 'The "No" button runs away. They can only say Yes.',
  },
  {
    name: 'Fight Ender',
    slug: 'fight-ender',
    emoji: '🏳️',
    badge: '₹49',
    description: 'Wave the white flag with an irresistible apology.',
  },
  {
    name: 'Paper Airplane Notes',
    slug: 'paper-airplane-notes',
    emoji: '✈️',
    badge: '₹49',
    description: 'Send paper airplanes carrying tiny love notes.',
  },
  {
    name: 'Jar of Fireflies',
    slug: 'jar-of-fireflies',
    emoji: '✨',
    badge: '₹49',
    description: 'Catch fireflies that glow with your messages.',
  },
  {
    name: 'Heartbeat Sync',
    slug: 'heartbeat-sync',
    emoji: '💓',
    badge: '₹49',
    description: 'Sync your heartbeats across any distance.',
  },
  {
    name: 'Locket',
    slug: 'locket',
    emoji: '📿',
    badge: '₹49',
    description: 'Open a vintage locket to reveal your photo together.',
  },
  {
    name: 'Wrapped Gift Tower',
    slug: 'wrapped-gift-tower',
    emoji: '🎁',
    badge: '₹49',
    description: 'Unwrap a tower of gifts, each with a surprise.',
  },
  {
    name: 'Bake Them a Cake',
    slug: 'bake-them-a-cake',
    emoji: '🎂',
    badge: '₹49',
    description: 'Virtually bake and decorate a cake for them.',
  },
  {
    name: 'Fortune Cookie',
    slug: 'fortune-cookie',
    emoji: '🥠',
    badge: 'Free',
    description: 'Crack open a cookie with a personalized fortune.',
  },
  {
    name: 'Candy Hearts',
    slug: 'candy-hearts',
    emoji: '💟',
    badge: 'Free',
    description: 'Custom candy hearts with your own messages.',
  },
  {
    name: 'Coupon Book',
    slug: 'coupon-book',
    emoji: '🎟️',
    badge: '₹49',
    description: 'Redeemable love coupons — hugs, kisses, and more.',
  },
  {
    name: 'Coffee Art',
    slug: 'coffee-art',
    emoji: '☕',
    badge: '₹49',
    description: 'Latte art that reveals a love message.',
  },
  {
    name: 'Cloud Messages',
    slug: 'cloud-messages',
    emoji: '☁️',
    badge: '₹49',
    description: 'Messages written across a dreamy sky.',
  },
  {
    name: 'Kitchen Table Letters',
    slug: 'kitchen-table-letters',
    emoji: '✉️',
    badge: '₹49',
    description: 'Letters left on the kitchen table, like the old days.',
  },
  {
    name: 'Paper Boat River',
    slug: 'paper-boat-river',
    emoji: '⛵',
    badge: '₹49',
    description: 'Send paper boats down a river of feelings.',
  },
  {
    name: 'Memory Scrapbook',
    slug: 'memory-scrapbook',
    emoji: '📸',
    badge: '₹49',
    description: 'A scrapbook of your favorite memories together.',
  },
  {
    name: 'Sunset Together',
    slug: 'sunset-together',
    emoji: '🌅',
    badge: '₹49',
    description: 'Watch a sunset side by side, wherever you are.',
  },
  {
    name: 'Moon Phases',
    slug: 'moon-phases',
    emoji: '🌙',
    badge: '₹49',
    description: 'Each moon phase reveals a love milestone.',
  },
  {
    name: 'Time Travel Letter',
    slug: 'time-travel-letter',
    emoji: '⏰',
    badge: '₹49',
    description: 'A letter from your future self about your love.',
  },
  {
    name: 'Before You / After You',
    slug: 'before-you-after-you',
    emoji: '🔄',
    badge: '₹49',
    description: 'A before-and-after of life since they showed up.',
  },
  {
    name: 'Goodnight',
    slug: 'goodnight',
    emoji: '🌙',
    badge: 'Free',
    description: 'Tuck them in with a sweet goodnight message.',
  },
  {
    name: 'Blanket of Stars Tuck-In',
    slug: 'blanket-of-stars-tuck-in',
    emoji: '🌟',
    badge: '₹49',
    description: 'Wrap them in a blanket made of stars.',
  },
  {
    name: 'Bedtime Story',
    slug: 'bedtime-story',
    emoji: '📖',
    badge: '₹49',
    description: 'A personalized bedtime story starring both of you.',
  },
  {
    name: 'Dream Catcher',
    slug: 'dream-catcher',
    emoji: '🪶',
    badge: '₹49',
    description: 'Catch their bad dreams and replace them with love.',
  },
  {
    name: 'Autumn Leaves',
    slug: 'autumn-leaves',
    emoji: '🍂',
    badge: '₹49',
    description: 'Falling leaves that reveal comforting messages.',
  },
  {
    name: 'Northern Lights',
    slug: 'northern-lights',
    emoji: '🌌',
    badge: '₹49',
    description: 'An aurora borealis painting your words in the sky.',
  },
  {
    name: 'Warm My Heart',
    slug: 'warm-my-heart',
    emoji: '🔥',
    badge: '₹49',
    description: 'Send warmth that literally heats up the screen.',
  },
];

const giftIndex = new Map(allGifts.map((g) => [g.slug, g]));

export function getGift(slug: string): GiftItem | undefined {
  return giftIndex.get(slug);
}

export const heroGiftSlugs = [
  'love-jar',
  'wishing-dandelion',
  'the-proposal',
  'spotify-wrapped',
  'sorry-puppy',
] as const;

export const heroGiftDescriptions: Record<string, string> = {
  'love-jar': "Shake to pull random love notes they'll cry over",
  'wishing-dandelion': 'Blow to scatter seeds carrying your wishes',
  'the-proposal': 'The "No" button runs away. They can only say Yes.',
  'spotify-wrapped': 'Their relationship stats, Wrapped-style',
  'sorry-puppy': 'A sad puppy in the rain. Your taps clear the sky.',
};

export type OccasionKey =
  | 'sorry'
  | 'miss-you'
  | 'propose'
  | 'birthday'
  | 'just-because'
  | 'funny'
  | 'anniversary'
  | 'goodnight'
  | 'cheer-up'
  | 'all';

export interface OccasionFilter {
  key: OccasionKey;
  label: string;
  slugs: string[];
}

export const occasions: OccasionFilter[] = [
  {
    key: 'sorry',
    label: '😢 Sorry',
    slugs: ['sorry-puppy', 'reverse-love-letter', 'fight-ender', 'cheer-up'],
  },
  {
    key: 'miss-you',
    label: '🥺 Miss You',
    slugs: [
      'miss-you',
      'love-jar',
      'wishing-dandelion',
      'paper-airplane-notes',
      'jar-of-fireflies',
      'heartbeat-sync',
    ],
  },
  {
    key: 'propose',
    label: '💍 Propose',
    slugs: ['the-proposal', 'love-lock-bridge', 'star-wish', 'locket'],
  },
  {
    key: 'birthday',
    label: '🎂 Birthday',
    slugs: [
      'wrapped-gift-tower',
      'bake-them-a-cake',
      'fortune-cookie',
      'candy-hearts',
      'coupon-book',
    ],
  },
  {
    key: 'just-because',
    label: '💕 Just Because',
    slugs: [
      'just-because',
      'love-jar',
      'love-receipt',
      'coffee-art',
      'cloud-messages',
      'kitchen-table-letters',
      'paper-boat-river',
    ],
  },
  {
    key: 'funny',
    label: '😂 Funny',
    slugs: [
      'spotify-wrapped',
      'love-receipt',
      'terms-and-conditions',
      'rate-my-partner',
      'villain-origin-story',
      'unsubscribe',
      'ctrl-z-fights',
      'crime-board',
      'loading-screen-of-love',
    ],
  },
  {
    key: 'anniversary',
    label: '💞 Anniversary',
    slugs: [
      '365-jar',
      'growing-garden',
      'memory-scrapbook',
      'snow-globe',
      'sunset-together',
      'moon-phases',
      'love-lock-bridge',
      'time-travel-letter',
      'before-you-after-you',
    ],
  },
  {
    key: 'goodnight',
    label: '🌙 Goodnight',
    slugs: [
      'goodnight',
      'blanket-of-stars-tuck-in',
      'bedtime-story',
      'dream-catcher',
    ],
  },
  {
    key: 'cheer-up',
    label: '🌈 Cheer Up',
    slugs: [
      'cheer-up',
      'autumn-leaves',
      'northern-lights',
      'warm-my-heart',
      'good-morning',
    ],
  },
];
