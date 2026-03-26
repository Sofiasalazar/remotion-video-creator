import { useCurrentFrame, useVideoConfig, interpolateColors, SpringConfig } from 'remotion';
import { noise2D, noise3D } from '@remotion/noise';

// ─── Spring Presets ─────────────────────────────────────────────────
// Remotion docs: damping 200 = smooth/settled, lower = more bounce
export const SPRING = {
  SMOOTH: { damping: 200 } as SpringConfig,
  BOUNCY: { damping: 12, stiffness: 100, mass: 0.8 } as SpringConfig,
  SNAPPY: { damping: 30, stiffness: 200 } as SpringConfig,
  DRAMATIC: { damping: 8, stiffness: 40, mass: 1.5 } as SpringConfig,
} as const;

// ─── Stagger Delays (in frames) ────────────────────────────────────
export const STAGGER = {
  FAST: 3,
  NORMAL: 5,
  SLOW: 8,
  DRAMATIC: 12,
} as const;

// ─── Hooks ──────────────────────────────────────────────────────────

/**
 * Oscillating value for glow, scale, opacity pulses.
 * Returns a value oscillating between -amplitude and +amplitude around 0.
 * Add to a base value: `const scale = 1 + usePulse(0.08, 0.05);`
 */
export function usePulse(speed = 0.08, amplitude = 0.1): number {
  const frame = useCurrentFrame();
  return Math.sin(frame * speed) * amplitude;
}

/**
 * 2D noise for organic position offsets.
 * Returns { x, y } each in range [-1, 1], scaled by `scale`.
 */
export function useNoise2D(seed: string, speed = 0.02, scale = 1): { x: number; y: number } {
  const frame = useCurrentFrame();
  const t = frame * speed;
  return {
    x: noise2D(seed + '-x', t, 0) * scale,
    y: noise2D(seed + '-y', 0, t) * scale,
  };
}

/**
 * 3D noise for time-varying organic motion.
 * Returns a single value in range [-scale, scale].
 */
export function useNoise3D(seed: string, x: number, y: number, speed = 0.02, scale = 1): number {
  const frame = useCurrentFrame();
  return noise3D(seed, x, y, frame * speed) * scale;
}

/**
 * Raw noise functions for use in loops (no hook dependency).
 * Use inside .map() or rendering loops where you need per-item noise.
 */
export { noise2D, noise3D };

/**
 * Smooth color transition over frames.
 * `colors` array length must match `stops` array length.
 * Stops are frame numbers (absolute within the scene).
 */
export function useColorTransition(stops: number[], colors: string[]): string {
  const frame = useCurrentFrame();
  return interpolateColors(frame, stops, colors);
}

/**
 * Derive a lighter or shifted version of a hex color for secondary accent.
 */
export function lightenColor(hex: string, amount = 0.3): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Shift a hex color's hue slightly for complementary accents.
 */
export function shiftHue(hex: string, degrees = 30): string {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  // Simple hue rotation via channel cycling
  const shift = degrees / 120;
  if (shift > 0) {
    const temp = r;
    r = Math.round(r * (1 - shift) + g * shift);
    g = Math.round(g * (1 - shift) + b * shift);
    b = Math.round(b * (1 - shift) + temp * shift);
  }
  return `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
}
