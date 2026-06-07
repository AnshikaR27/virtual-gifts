import type { CSSProperties } from 'react';

/**
 * <ItemSprites> — one 12×12 pixel sprite per tiffin menu choice. Look one up by
 * its menu label with getItemSprite(name).
 */

interface ItemProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

function Sprite({
  size = 14,
  className,
  style,
  children,
}: ItemProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function GulabJamunSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="2" y="2" width="8" height="8" fill="#a16319" />
      <rect x="3" y="1" width="6" height="1" fill="#a16319" />
      <rect x="1" y="3" width="1" height="6" fill="#a16319" />
      <rect x="10" y="3" width="1" height="6" fill="#a16319" />
      <rect x="3" y="10" width="6" height="1" fill="#a16319" />
      <rect x="3" y="3" width="2" height="2" fill="#d8a258" />
    </Sprite>
  );
}

export function JalebiSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="2" y="2" width="8" height="2" fill="#f5a623" />
      <rect x="2" y="2" width="2" height="8" fill="#f5a623" />
      <rect x="8" y="2" width="2" height="6" fill="#f5a623" />
      <rect x="2" y="8" width="6" height="2" fill="#f5a623" />
      <rect x="5" y="5" width="2" height="2" fill="#ffcf6b" />
    </Sprite>
  );
}

export function RasgullaSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="2" y="3" width="8" height="6" fill="#fff" />
      <rect x="3" y="2" width="6" height="1" fill="#fff" />
      <rect x="3" y="9" width="6" height="1" fill="#fff" />
      <rect x="1" y="4" width="1" height="4" fill="#e9efff" />
      <rect x="10" y="4" width="1" height="4" fill="#e9efff" />
      <rect x="4" y="4" width="2" height="2" fill="#eef4ff" />
    </Sprite>
  );
}

export function KajuKatliSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="5" y="2" width="2" height="8" fill="#efe2c0" />
      <rect x="3" y="4" width="6" height="4" fill="#efe2c0" />
      <rect x="4" y="3" width="4" height="6" fill="#efe2c0" />
      <rect x="5" y="2" width="2" height="2" fill="#cdd3d6" />
    </Sprite>
  );
}

export function MathriSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="2" y="3" width="8" height="6" fill="#e8c878" />
      <rect x="3" y="4" width="6" height="4" fill="#f0d898" />
      <rect x="4" y="5" width="1" height="1" fill="#8a6028" />
      <rect x="7" y="6" width="1" height="1" fill="#8a6028" />
      <rect x="5" y="7" width="1" height="1" fill="#8a6028" />
    </Sprite>
  );
}

export function SamosaSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="5" y="2" width="2" height="1" fill="#c98a3a" />
      <rect x="4" y="3" width="4" height="2" fill="#c98a3a" />
      <rect x="3" y="5" width="6" height="2" fill="#c98a3a" />
      <rect x="2" y="7" width="8" height="2" fill="#c98a3a" />
      <rect x="2" y="9" width="8" height="1" fill="#a86d28" />
      <rect x="5" y="4" width="2" height="3" fill="#e0a85a" />
    </Sprite>
  );
}

export function ChakliSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="3" y="2" width="6" height="1" fill="#b5651d" />
      <rect x="2" y="3" width="1" height="6" fill="#b5651d" />
      <rect x="9" y="3" width="1" height="6" fill="#b5651d" />
      <rect x="3" y="9" width="6" height="1" fill="#b5651d" />
      <rect x="4" y="4" width="4" height="1" fill="#b5651d" />
      <rect x="4" y="4" width="1" height="3" fill="#b5651d" />
      <rect x="6" y="6" width="2" height="1" fill="#b5651d" />
      <rect x="5" y="5" width="2" height="2" fill="#d98a3a" />
    </Sprite>
  );
}

export function KhakhraSprite(p: ItemProps) {
  return (
    <Sprite {...p}>
      <rect x="2" y="3" width="8" height="6" fill="#d9a441" />
      <rect x="3" y="2" width="6" height="1" fill="#d9a441" />
      <rect x="3" y="9" width="6" height="1" fill="#d9a441" />
      <rect x="4" y="4" width="1" height="1" fill="#a86d28" />
      <rect x="7" y="5" width="1" height="1" fill="#a86d28" />
      <rect x="5" y="7" width="1" height="1" fill="#a86d28" />
      <rect x="8" y="6" width="1" height="1" fill="#a86d28" />
    </Sprite>
  );
}

type ItemComponent = (p: ItemProps) => JSX.Element;

const ITEM_MAP: Record<string, ItemComponent> = {
  'Gulab Jamun': GulabJamunSprite,
  Jalebi: JalebiSprite,
  Rasgulla: RasgullaSprite,
  'Kaju Katli': KajuKatliSprite,
  Mathri: MathriSprite,
  Samosa: SamosaSprite,
  Chakli: ChakliSprite,
  Khakhra: KhakhraSprite,
};

/** Returns the sprite component for a menu label, falling back to a sweet. */
export function getItemSprite(name: string): ItemComponent {
  return ITEM_MAP[name] ?? GulabJamunSprite;
}
