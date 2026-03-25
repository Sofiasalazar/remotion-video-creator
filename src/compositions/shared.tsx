import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { FontStyle } from '../types';

// ─── Font helpers ────────────────────────────────────────────────
export function getFontFamily(style: FontStyle): string {
  switch (style) {
    case 'bold': return "'Inter', sans-serif";
    case 'elegant': return "Georgia, 'Times New Roman', serif";
    default: return "'Inter', sans-serif";
  }
}

export function getFontWeight(style: FontStyle): number {
  return style === 'bold' ? 900 : style === 'elegant' ? 600 : 700;
}

// ─── Gradient Background ─────────────────────────────────────────
export const GradientBg: React.FC<{
  color1: string;
  color2: string;
  angle?: number;
  opacity?: number;
}> = ({ color1, color2, angle = 135, opacity = 1 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
      opacity,
    }}
  />
);

// ─── Radial Glow ─────────────────────────────────────────────────
export const RadialGlow: React.FC<{
  color: string;
  size?: number;
  x?: string;
  y?: string;
  opacity?: number;
}> = ({ color, size = 600, x = '50%', y = '50%', opacity = 0.3 }) => (
  <div
    style={{
      position: 'absolute',
      width: size,
      height: size,
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

// ─── Floating Particles ──────────────────────────────────────────
export const Particles: React.FC<{
  count?: number;
  color?: string;
  seed?: number;
}> = ({ count = 20, color = 'rgba(139,92,246,0.3)', seed = 42 }) => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => {
    const rng = (n: number) => {
      let s = seed + n * 7919;
      s = ((s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      return s;
    };
    return Array.from({ length: count }, (_, i) => ({
      x: rng(i) * 100,
      y: rng(i + 100) * 100,
      size: 2 + rng(i + 200) * 4,
      speed: 0.2 + rng(i + 300) * 0.5,
      phase: rng(i + 400) * Math.PI * 2,
    }));
  }, [count, seed]);

  return (
    <>
      {particles.map((p, i) => {
        const yOffset = Math.sin(frame * 0.02 * p.speed + p.phase) * 15;
        const xOffset = Math.cos(frame * 0.015 * p.speed + p.phase) * 10;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: color,
              transform: `translate(${xOffset}px, ${yOffset}px)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

// ─── Grid Pattern Background ─────────────────────────────────────
export const GridPattern: React.FC<{
  color?: string;
  size?: number;
  opacity?: number;
}> = ({ color = '#8b5cf6', size = 60, opacity = 0.06 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `
        linear-gradient(${color} 1px, transparent 1px),
        linear-gradient(90deg, ${color} 1px, transparent 1px)
      `,
      backgroundSize: `${size}px ${size}px`,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

// ─── Glowing Card ────────────────────────────────────────────────
export const GlowCard: React.FC<{
  children: React.ReactNode;
  glowColor: string;
  width?: number | string;
  padding?: number;
  style?: React.CSSProperties;
}> = ({ children, glowColor, width = 'auto', padding = 24, style }) => (
  <div
    style={{
      width,
      padding,
      borderRadius: 16,
      border: `1px solid ${glowColor}40`,
      background: 'rgba(20, 20, 20, 0.8)',
      boxShadow: `
        0 0 20px ${glowColor}20,
        0 0 60px ${glowColor}10,
        inset 0 1px 0 rgba(255,255,255,0.05)
      `,
      backdropFilter: 'blur(10px)',
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Animated Gradient Text ──────────────────────────────────────
export const GradientText: React.FC<{
  children: React.ReactNode;
  from: string;
  to: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  style?: React.CSSProperties;
}> = ({ children, from, to, fontSize, fontFamily, fontWeight, style }) => (
  <div
    style={{
      fontSize,
      fontFamily,
      fontWeight,
      lineHeight: 1.1,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Neon Glow Text ──────────────────────────────────────────────
export const NeonText: React.FC<{
  children: React.ReactNode;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  glowIntensity?: number;
  style?: React.CSSProperties;
}> = ({ children, color, fontSize, fontFamily, fontWeight, glowIntensity = 1, style }) => (
  <div
    style={{
      fontSize,
      fontFamily,
      fontWeight,
      color,
      lineHeight: 1.1,
      textShadow: `
        0 0 ${10 * glowIntensity}px ${color}60,
        0 0 ${20 * glowIntensity}px ${color}40,
        0 0 ${40 * glowIntensity}px ${color}20,
        0 0 ${80 * glowIntensity}px ${color}10
      `,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Animated Divider Line ───────────────────────────────────────
export const AnimatedDivider: React.FC<{
  color: string;
  width: number;
  animateFrom?: 'left' | 'center';
}> = ({ color, width, animateFrom = 'center' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const currentWidth = interpolate(progress, [0, 1], [0, width]);

  return (
    <div
      style={{
        width: currentWidth,
        height: 3,
        borderRadius: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        margin: animateFrom === 'center' ? '0 auto' : undefined,
      }}
    />
  );
};

// ─── Icon Placeholder (colored circle with symbol) ───────────────
export const IconBadge: React.FC<{
  icon: string; // emoji or single char
  color: string;
  size?: number;
}> = ({ icon, color, size = 48 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.5,
      background: `linear-gradient(135deg, ${color}30, ${color}10)`,
      border: `1px solid ${color}50`,
      boxShadow: `0 0 20px ${color}20`,
    }}
  >
    {icon}
  </div>
);

// ─── Animated Counter ────────────────────────────────────────────
export const AnimatedNumber: React.FC<{
  value: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
}> = ({ value, color, fontSize, fontFamily, fontWeight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 20, stiffness: 40 } });

  // If the value is a number, animate it counting up
  const numericMatch = value.match(/^(\d+)(.*)/);
  let displayValue = value;
  if (numericMatch) {
    const num = parseInt(numericMatch[1]);
    const suffix = numericMatch[2];
    displayValue = Math.round(num * progress) + suffix;
  }

  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        color,
        textShadow: `0 0 30px ${color}40, 0 0 60px ${color}20`,
      }}
    >
      {displayValue}
    </div>
  );
};

// ─── Horizontal Floating Shapes (ambient) ────────────────────────
export const FloatingShapes: React.FC<{
  color: string;
}> = ({ color }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {/* Top-right circle */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          border: `1px solid ${color}15`,
          transform: `rotate(${frame * 0.3}deg)`,
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-left circle */}
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: `1px solid ${color}15`,
          transform: `rotate(${-frame * 0.2}deg)`,
          pointerEvents: 'none',
        }}
      />
      {/* Center diamond */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 40,
          height: 40,
          border: `1px solid ${color}10`,
          transform: `rotate(${45 + frame * 0.5}deg)`,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
