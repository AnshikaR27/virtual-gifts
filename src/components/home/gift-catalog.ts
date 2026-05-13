export interface GiftItem {
  name: string;
  slug: string;
  gradient: [string, string];
  badge: string;
  dark?: boolean;
  emoji: string;
}

export interface GiftRowData {
  id: string;
  title: string;
  emoji: string;
  priceBadge: string;
  gifts: GiftItem[];
}

export const giftRows: GiftRowData[] = [
  {
    id: 'quick-sweet',
    title: 'Quick & Sweet',
    emoji: '⚡',
    priceBadge: 'Free',
    gifts: [
      {
        name: 'Sorry Puppy',
        slug: 'sorry-puppy',
        gradient: ['#FFD9E0', '#FDD0EA'],
        badge: 'Free',
        emoji: '🐶',
      },
      {
        name: 'Miss You',
        slug: 'miss-you',
        gradient: ['#FDD0EA', '#EDDCFF'],
        badge: 'Free',
        emoji: '💌',
      },
      {
        name: 'Good Morning',
        slug: 'good-morning',
        gradient: ['#FFD8ED', '#F1F3FF'],
        badge: 'Free',
        emoji: '🌅',
      },
      {
        name: 'Just Because',
        slug: 'just-because',
        gradient: ['#EDDCFF', '#FFD9E0'],
        badge: 'Free',
        emoji: '🎀',
      },
      {
        name: 'Cheer Up',
        slug: 'cheer-up',
        gradient: ['#F1F3FF', '#FDD0EA'],
        badge: 'Free',
        emoji: '🌈',
      },
    ],
  },
  {
    id: 'make-them-melt',
    title: 'Make Them Melt',
    emoji: '💖',
    priceBadge: '₹49',
    gifts: [
      {
        name: 'Love Jar',
        slug: 'love-jar',
        gradient: ['#FDD0EA', '#FFB1C3'],
        badge: '₹49',
        emoji: '🫙',
      },
      {
        name: 'Wishing Dandelion',
        slug: 'wishing-dandelion',
        gradient: ['#EDDCFF', '#E1E8FD'],
        badge: '₹49',
        emoji: '🌼',
      },
      {
        name: 'Origami Unfold',
        slug: 'origami-unfold',
        gradient: ['#FFD9E0', '#EDDCFF'],
        badge: '₹49',
        emoji: '🦢',
      },
      {
        name: 'Snow Globe',
        slug: 'snow-globe',
        gradient: ['#E1E8FD', '#F1F3FF'],
        badge: '₹49',
        emoji: '❄️',
      },
      {
        name: 'Star Wish',
        slug: 'star-wish',
        gradient: ['#E9EDFF', '#FFD8ED'],
        badge: '₹49',
        emoji: '⭐',
      },
    ],
  },
  {
    id: 'wildcard',
    title: 'Wildcard',
    emoji: '🤯',
    priceBadge: '₹49',
    gifts: [
      {
        name: 'Spotify Wrapped',
        slug: 'spotify-wrapped',
        gradient: ['#9D174D', '#5A4B6E'],
        badge: '₹49',
        dark: true,
        emoji: '🎵',
      },
      {
        name: 'Love Receipt',
        slug: 'love-receipt',
        gradient: ['#5A4B6E', '#780037'],
        badge: '₹49',
        dark: true,
        emoji: '🧾',
      },
      {
        name: 'Loading Screen of Love',
        slug: 'loading-screen-of-love',
        gradient: ['#780037', '#423455'],
        badge: '₹49',
        dark: true,
        emoji: '⏳',
      },
      {
        name: 'Reverse Love Letter',
        slug: 'reverse-love-letter',
        gradient: ['#423455', '#9D174D'],
        badge: '₹49',
        dark: true,
        emoji: '💌',
      },
      {
        name: 'Terms & Conditions',
        slug: 'terms-and-conditions',
        gradient: ['#9D174D', '#423455'],
        badge: '₹49',
        dark: true,
        emoji: '📜',
      },
    ],
  },
  {
    id: 'play-together',
    title: 'Play Together',
    emoji: '💑',
    priceBadge: 'Free+',
    gifts: [
      {
        name: 'Catch My Love',
        slug: 'catch-my-love',
        gradient: ['#FFD9E0', '#EDDCFF'],
        badge: 'Free',
        emoji: '💘',
      },
      {
        name: 'Love Lock Bridge',
        slug: 'love-lock-bridge',
        gradient: ['#EDDCFF', '#FDD0EA'],
        badge: '₹49',
        emoji: '🔐',
      },
      {
        name: 'Spin the Wheel',
        slug: 'spin-the-wheel',
        gradient: ['#FDD0EA', '#F1F3FF'],
        badge: 'Free',
        emoji: '🎡',
      },
      {
        name: 'Treasure Map',
        slug: 'treasure-map',
        gradient: ['#F1F3FF', '#FFD8ED'],
        badge: 'Free',
        emoji: '🗺️',
      },
    ],
  },
  {
    id: 'for-the-long-run',
    title: 'For The Long Run',
    emoji: '🔄',
    priceBadge: '₹49+',
    gifts: [
      {
        name: '365 Jar',
        slug: '365-jar',
        gradient: ['#FFB1C3', '#D2BFE8'],
        badge: '₹149',
        emoji: '📅',
      },
      {
        name: 'Growing Garden',
        slug: 'growing-garden',
        gradient: ['#D2BFE8', '#FFD9E0'],
        badge: '₹149',
        emoji: '🌱',
      },
      {
        name: 'Our Playlist',
        slug: 'our-playlist',
        gradient: ['#EDDCFF', '#FFB1C3'],
        badge: '₹49',
        emoji: '🎶',
      },
    ],
  },
];
