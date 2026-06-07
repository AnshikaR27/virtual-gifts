import { PixelHeart } from './pixel-icons';

/**
 * <PixelHUD> — score (zero-padded) + a row of pixel-heart lives. Render inside
 * <GameFrame>'s `hud` slot.
 */

interface PixelHUDProps {
  score: number;
  lives?: number;
  maxLives?: number;
  /** Show the "LIVES" label before the hearts (level-start style). */
  showLivesLabel?: boolean;
}

export function PixelHUD({
  score,
  lives = 3,
  maxLives = 3,
  showLivesLabel = true,
}: PixelHUDProps) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <span>SCORE {String(score).padStart(3, '0')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {showLivesLabel ? <span>LIVES</span> : null}
        {Array.from({ length: maxLives }).map((_, i) => (
          <PixelHeart
            key={i}
            size={12}
            style={{ opacity: i < lives ? 1 : 0.25 }}
          />
        ))}
      </div>
    </>
  );
}
