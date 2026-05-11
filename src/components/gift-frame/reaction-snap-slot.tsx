'use client';

export function useReactionSnap() {
  return {
    isSupported: false,
    capture: () => {},
  };
}

export function ReactionSnapSlot() {
  return <div data-reaction-snap-slot="" />;
}
