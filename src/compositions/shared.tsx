import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { makeCircle, makeStar, makeTriangle, makeRect } from '@remotion/shapes';
import { evolvePath, interpolatePath } from '@remotion/paths';
import { noise3D } from '@remotion/noise';
import type { FontStyle } from '../types';
import { SPRING, STAGGER, usePulse } from '../lib/animation';

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
  animateAngle?: boolean;
}> = ({ color1, color2, angle = 135, opacity = 1, animateAngle = false }) => {
  const frame = useCurrentFrame();
  const currentAngle = animateAngle ? angle + frame * 0.3 : angle;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${currentAngle}deg, ${color1}, ${color2})`,
        opacity,
      }}
    />
  );
};

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

// ─── Color-Shifting Radial Glow ──────────────────────────────────
export const ColorShiftGlow: React.FC<{
  colors: string[];
  stops?: number[];
  size?: number;
  x?: string;
  y?: string;
  opacity?: number;
}> = ({ colors, stops, size = 600, x = '50%', y = '50%', opacity = 0.3 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const defaultStops = colors.map((_, i) => Math.round((i / (colors.length - 1)) * durationInFrames));
  const currentColor = interpolateColors(frame, stops || defaultStops, colors);

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentColor} 0%, transparent 70%)`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

// ─── Floating Particles (noise-driven) ───────────────────────────
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
      speed: 0.3 + rng(i + 300) * 0.7,
    }));
  }, [count, seed]);

  return (
    <>
      {particles.map((p, i) => {
        const xOffset = noise3D(`p-x-${seed}`, p.x, p.y, frame * 0.015 * p.speed) * 20;
        const yOffset = noise3D(`p-y-${seed}`, p.x, p.y, frame * 0.012 * p.speed) * 25;
        const opacityNoise = 0.5 + noise3D(`p-o-${seed}`, i, 0, frame * 0.02) * 0.4;

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
              opacity: opacityNoise,
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
      border: `1.5px solid ${glowColor}90`,
      background: 'rgba(14, 14, 20, 0.9)',
      boxShadow: `
        0 0 15px ${glowColor}50,
        0 0 40px ${glowColor}25,
        inset 0 1px 0 rgba(255,255,255,0.08)
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
  const progress = spring({ frame, fps, config: SPRING.SMOOTH });
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
  icon: string;
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
  const progress = spring({ frame, fps, config: SPRING.DRAMATIC });

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

// ─── SVG Animated Circle (stroke draw-in) ────────────────────
export const AnimatedCircle: React.FC<{
  radius?: number;
  color: string;
  strokeWidth?: number;
  x?: string;
  y?: string;
}> = ({ radius = 60, color, strokeWidth = 2, x = '50%', y = '50%' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: SPRING.SMOOTH });
  const { path } = makeCircle({ radius });
  const evolved = evolvePath(progress, path);

  return (
    <svg
      width={radius * 2 + strokeWidth * 2}
      height={radius * 2 + strokeWidth * 2}
      style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={evolved.strokeDasharray}
        strokeDashoffset={evolved.strokeDashoffset}
        transform={`translate(${strokeWidth}, ${strokeWidth})`}
      />
    </svg>
  );
};

// ─── SVG Animated Triangle ───────────────────────────────────
export const AnimatedTriangle: React.FC<{
  size?: number;
  color: string;
  direction?: 'up' | 'down';
  x?: string;
  y?: string;
}> = ({ size = 40, color, direction = 'up', x = '50%', y = '50%' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: SPRING.BOUNCY });
  const { path } = makeTriangle({ length: size, direction });
  const evolved = evolvePath(progress, path);
  const rotation = interpolate(frame, [0, 120], [0, 360], { extrapolateRight: 'extend' });

  return (
    <svg
      width={size + 4}
      height={size + 4}
      style={{
        position: 'absolute', left: x, top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        pointerEvents: 'none', opacity: 0.5,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={evolved.strokeDasharray}
        strokeDashoffset={evolved.strokeDashoffset}
        transform="translate(2, 2)"
      />
    </svg>
  );
};

// ─── SVG Animated Star ───────────────────────────────────────
export const AnimatedStar: React.FC<{
  size?: number;
  color: string;
  x?: string;
  y?: string;
}> = ({ size = 30, color, x = '50%', y = '50%' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: SPRING.BOUNCY });
  const { path } = makeStar({ innerRadius: size * 0.4, outerRadius: size, points: 5 });
  const evolved = evolvePath(progress, path);
  const rotation = frame * 0.5;
  const scale = interpolate(progress, [0, 1], [0.5, 1]);

  return (
    <svg
      width={size * 2 + 4}
      height={size * 2 + 4}
      style={{
        position: 'absolute', left: x, top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        pointerEvents: 'none',
      }}
    >
      <path
        d={path}
        fill={`${color}15`}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={evolved.strokeDasharray}
        strokeDashoffset={evolved.strokeDashoffset}
        transform={`translate(${size + 2}, ${size + 2})`}
      />
    </svg>
  );
};

// ─── Morphing Shape (two SVG paths interpolate) ──────────────
export const MorphingShape: React.FC<{
  size?: number;
  color: string;
  x?: string;
  y?: string;
  fromShape?: 'circle' | 'star' | 'rect';
  toShape?: 'circle' | 'star' | 'rect';
}> = ({ size = 100, color, x = '50%', y = '50%', fromShape = 'circle', toShape = 'star' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: SPRING.SMOOTH });

  const shapeMap = {
    circle: () => makeCircle({ radius: size }).path,
    star: () => makeStar({ innerRadius: size * 0.4, outerRadius: size, points: 5 }).path,
    rect: () => makeRect({ width: size * 1.6, height: size * 1.6, cornerRadius: size * 0.2 }).path,
  };

  const fromPath = shapeMap[fromShape]();
  const toPath = shapeMap[toShape]();
  const morphedPath = interpolatePath(progress, fromPath, toPath);
  const rotation = frame * 0.3;

  return (
    <svg
      width={size * 2.5}
      height={size * 2.5}
      viewBox={`${-size * 1.25} ${-size * 1.25} ${size * 2.5} ${size * 2.5}`}
      style={{
        position: 'absolute', left: x, top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        pointerEvents: 'none', opacity: 0.5,
      }}
    >
      <path d={morphedPath} fill={color} stroke={color} strokeWidth={1} />
    </svg>
  );
};

// ─── SVG Decoration Cluster ──────────────────────────────────
export const SVGDecorationCluster: React.FC<{
  color: string;
  seed?: number;
}> = ({ color, seed = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = React.useMemo(() => {
    const rng = (n: number) => {
      let s = seed + n * 7919;
      s = ((s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      return s;
    };
    return Array.from({ length: 8 }, (_, i) => ({
      x: 5 + rng(i) * 90,
      y: 5 + rng(i + 50) * 90,
      size: 15 + rng(i + 100) * 25,
      type: Math.floor(rng(i + 150) * 3) as 0 | 1 | 2,
      delay: Math.floor(rng(i + 200) * 20),
    }));
  }, [seed]);

  return (
    <>
      {items.map((item, i) => {
        const progress = spring({
          frame: Math.max(0, frame - item.delay),
          fps, config: SPRING.SMOOTH,
        });
        const rotation = frame * (0.2 + i * 0.1);
        const pathData =
          item.type === 0 ? makeCircle({ radius: item.size / 2 }).path
          : item.type === 1 ? makeTriangle({ length: item.size, direction: 'up' }).path
          : makeStar({ innerRadius: item.size * 0.3, outerRadius: item.size / 2, points: 4 }).path;
        const evolved = evolvePath(progress, pathData);

        return (
          <svg
            key={i}
            width={item.size + 4}
            height={item.size + 4}
            style={{
              position: 'absolute',
              left: `${item.x}%`, top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              pointerEvents: 'none', opacity: 0.55,
            }}
          >
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth={1}
              strokeDasharray={evolved.strokeDasharray}
              strokeDashoffset={evolved.strokeDashoffset}
              transform="translate(2, 2)"
            />
          </svg>
        );
      })}
    </>
  );
};

// ─── Animated Progress Bar ───────────────────────────────────
export const AnimatedProgressBar: React.FC<{
  value: number;
  color: string;
  height?: number;
  width?: number | string;
  label?: string;
  delay?: number;
}> = ({ value, color, height = 6, width = '100%', label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - delay), fps,
    config: SPRING.SMOOTH,
  });
  const fillWidth = interpolate(progress, [0, 1], [0, value]);

  return (
    <div style={{ width }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#A3A3A3', fontFamily: "'Inter', sans-serif" }}>{label}</span>
          <span style={{ fontSize: 12, color, fontFamily: "'Inter', sans-serif" }}>{Math.round(fillWidth)}%</span>
        </div>
      )}
      <div style={{ width: '100%', height, backgroundColor: '#1a1a2a', borderRadius: height / 2, overflow: 'hidden', border: '1px solid #2a2a3a' }}>
        <div style={{
          width: `${fillWidth}%`, height: '100%', borderRadius: height / 2,
          background: `linear-gradient(90deg, ${color}dd, ${color})`,
          boxShadow: `0 0 15px ${color}60, 0 0 30px ${color}30`,
        }} />
      </div>
    </div>
  );
};

// ─── Animated Bar Chart ──────────────────────────────────────
export const AnimatedBarChart: React.FC<{
  bars: Array<{ label: string; value: number; color: string }>;
  height?: number;
  barWidth?: number;
  gap?: number;
}> = ({ bars, height = 120, barWidth = 40, gap = 12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxVal = Math.max(...bars.map(b => b.value), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap, height }}>
      {bars.map((bar, i) => {
        const progress = spring({
          frame: Math.max(0, frame - STAGGER.NORMAL - i * STAGGER.NORMAL), fps,
          config: SPRING.SMOOTH,
        });
        const barHeight = interpolate(progress, [0, 1], [0, (bar.value / maxVal) * height * 0.85]);
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: barWidth, height: barHeight, borderRadius: 6,
              background: `linear-gradient(180deg, ${bar.color}, ${bar.color}aa)`,
              boxShadow: `0 0 15px ${bar.color}50, 0 0 30px ${bar.color}25`,
              border: `1px solid ${bar.color}60`,
            }} />
            <span style={{ fontSize: 10, color: '#A3A3A3', fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Animated Donut Ring ─────────────────────────────────────
export const AnimatedDonutRing: React.FC<{
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}> = ({ percentage, color, size = 80, strokeWidth = 6, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: SPRING.SMOOTH });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillAmount = interpolate(progress, [0, 1], [circumference, circumference * (1 - percentage / 100)]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a1a2a" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={fillAmount}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}80) drop-shadow(0 0 20px ${color}40)` }}
        />
      </svg>
      {label && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color, fontFamily: "'Inter', sans-serif",
        }}>
          {Math.round(percentage * progress)}%
        </div>
      )}
    </div>
  );
};

// ─── Staggered Reveal Wrapper ────────────────────────────────
export const StaggeredReveal: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'scale';
}> = ({ children, staggerDelay = STAGGER.FAST, direction = 'up' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {React.Children.map(children, (child, i) => {
        const p = spring({
          frame: Math.max(0, frame - i * staggerDelay), fps,
          config: SPRING.BOUNCY,
        });
        const transform =
          direction === 'up' ? `translateY(${interpolate(p, [0, 1], [25, 0])}px)`
          : direction === 'down' ? `translateY(${interpolate(p, [0, 1], [-25, 0])}px)`
          : direction === 'left' ? `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`
          : `scale(${interpolate(p, [0, 1], [0.85, 1])})`;

        return (
          <div style={{ opacity: p, transform }}>
            {child}
          </div>
        );
      })}
    </>
  );
};

// ─── Expanding Ring (reusable) ───────────────────────────────
export const ExpandingRing: React.FC<{
  color: string;
  size?: number;
  duration?: number;
}> = ({ color, size = 250, duration = 40 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [0.5, 2], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, duration], [0.25, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}`,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity, pointerEvents: 'none',
    }} />
  );
};

// ═══════════════════════════════════════════════════════════════
// NEW LAYOUT COMPONENTS -- replace repetitive card grids
// ═══════════════════════════════════════════════════════════════

// ─── Spotlight Reveal (one item at a time, centered) ─────────
export const SpotlightReveal: React.FC<{
  items: Array<{ icon: string; text: string }>;
  duration: number;
  accentColor: string;
  font: string;
  weight: number;
  colors?: string[];
}> = ({ items, duration, accentColor, font, weight, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const itemCount = items.length;
  const framesPerItem = Math.floor(duration / itemCount);
  const activeIndex = Math.min(Math.floor(frame / framesPerItem), itemCount - 1);
  const localFrame = frame - activeIndex * framesPerItem;

  const itemColors = colors || items.map((_, i) => {
    const hueShift = (i / itemCount) * 60;
    return accentColor; // fallback -- compositions can pass distinct colors
  });

  // Current item color via interpolateColors
  const colorStops = items.map((_, i) => i * framesPerItem);
  const currentGlow = itemColors.length >= 2
    ? interpolateColors(frame, colorStops, itemColors)
    : accentColor;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', width: '100%', position: 'relative',
    }}>
      {items.map((item, i) => {
        if (i !== activeIndex) return null;

        const enter = spring({ frame: localFrame, fps, config: SPRING.BOUNCY });
        const iconScale = spring({ frame: localFrame, fps, config: SPRING.DRAMATIC });
        const textSlide = spring({ frame: Math.max(0, localFrame - 4), fps, config: SPRING.SMOOTH });

        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
            opacity: enter,
          }}>
            {item.icon && (
              <div style={{
                fontSize: 72,
                transform: `scale(${interpolate(iconScale, [0, 1], [0.3, 1])})`,
                filter: `drop-shadow(0 0 20px ${currentGlow}60)`,
              }}>
                {item.icon}
              </div>
            )}
            <div style={{
              fontSize: 32,
              fontFamily: font,
              fontWeight: weight,
              color: '#fff',
              textAlign: 'center',
              maxWidth: 700,
              opacity: textSlide,
              transform: `translateY(${interpolate(textSlide, [0, 1], [20, 0])}px)`,
              textShadow: `0 0 20px ${currentGlow}30`,
            }}>
              {item.text}
            </div>
          </div>
        );
      })}

      {/* Progress dots */}
      <div style={{
        position: 'absolute', bottom: 40,
        display: 'flex', gap: 12, justifyContent: 'center',
      }}>
        {items.map((_, i) => (
          <div key={i} style={{
            width: i === activeIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === activeIndex ? currentGlow : `${accentColor}40`,
            transition: 'all 0.3s',
            boxShadow: i === activeIndex ? `0 0 10px ${currentGlow}80` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
};

// ─── Orbit Layout (items around a center) ────────────────────
export const OrbitLayout: React.FC<{
  items: Array<{ icon: string; text: string }>;
  centerLabel: string;
  accentColor: string;
  font: string;
  weight: number;
  radius?: number;
}> = ({ items, centerLabel, accentColor, font, weight, radius = 220 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globalRotation = frame * 0.15;

  // Center node
  const centerScale = spring({ frame, fps, config: SPRING.DRAMATIC });

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Center */}
      <div style={{
        position: 'absolute',
        transform: `scale(${interpolate(centerScale, [0, 1], [0.5, 1])})`,
        opacity: centerScale,
        zIndex: 2,
      }}>
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}25, ${accentColor}08)`,
          border: `2px solid ${accentColor}60`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 30px ${accentColor}30, 0 0 60px ${accentColor}15`,
        }}>
          <div style={{
            fontSize: 16, fontFamily: font, fontWeight: weight,
            color: '#fff', textAlign: 'center', padding: 12,
            lineHeight: 1.2,
          }}>
            {centerLabel}
          </div>
        </div>
      </div>

      {/* Orbiting items */}
      {items.map((item, i) => {
        const angle = (i / items.length) * Math.PI * 2 + (globalRotation * Math.PI / 180);
        const nodeDelay = STAGGER.SLOW + i * STAGGER.NORMAL;
        const nodeEnter = spring({ frame: Math.max(0, frame - nodeDelay), fps, config: SPRING.BOUNCY });

        const noiseX = noise3D('orbit-x', i, 0, frame * 0.01) * 5;
        const noiseY = noise3D('orbit-y', 0, i, frame * 0.01) * 5;

        const x = Math.cos(angle) * radius + noiseX;
        const y = Math.sin(angle) * radius * 0.6 + noiseY; // elliptical

        // Connector line
        const lineProgress = spring({ frame: Math.max(0, frame - nodeDelay + 3), fps, config: SPRING.SMOOTH });

        return (
          <React.Fragment key={i}>
            {/* Connector line */}
            <svg style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 1, height: 1, overflow: 'visible', pointerEvents: 'none', zIndex: 1,
            }}>
              <line
                x1={0} y1={0} x2={x * lineProgress} y2={y * lineProgress}
                stroke={`${accentColor}30`}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </svg>

            {/* Node */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${interpolate(nodeEnter, [0, 1], [0, 1])})`,
              opacity: nodeEnter,
              zIndex: 3,
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                  border: `1.5px solid ${accentColor}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: `0 0 15px ${accentColor}25`,
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: 12, fontFamily: font, fontWeight: 600,
                  color: '#ccc', textAlign: 'center', maxWidth: 100,
                  lineHeight: 1.2,
                }}>
                  {item.text}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Data Viz Row (horizontal bars with shimmer) ─────────────
export const DataVizRow: React.FC<{
  items: Array<{ icon: string; text: string }>;
  accentColor: string;
  font: string;
  weight: number;
}> = ({ items, accentColor, font, weight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barColors = [accentColor, '#84cc16', '#06b6d4', '#f59e0b'];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      width: '100%', padding: '0 40px',
    }}>
      {items.map((item, i) => {
        const delay = STAGGER.SLOW + i * STAGGER.SLOW;
        const enter = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.SMOOTH });
        const barFill = spring({ frame: Math.max(0, frame - delay - 5), fps, config: SPRING.SMOOTH });
        const shimmer = noise3D('bar-shimmer', i, 0, frame * 0.03) * 0.15;
        const color = barColors[i % barColors.length];

        // Extract numeric value from text for bar width
        const numMatch = item.text.match(/(\d+)/);
        const barPercent = numMatch ? Math.min(parseInt(numMatch[1]), 100) : 70 + i * 8;

        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            opacity: enter,
            transform: `translateX(${interpolate(enter, [0, 1], [-30, 0])}px)`,
          }}>
            {item.icon && (
              <div style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>
                {item.icon}
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{
                fontSize: 15, fontFamily: font, fontWeight: weight,
                color: '#fff',
              }}>
                {item.text}
              </div>
              <div style={{
                height: 8, borderRadius: 4, background: '#1a1a2a',
                overflow: 'hidden', border: '1px solid #2a2a3a',
              }}>
                <div style={{
                  width: `${barPercent * barFill}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${color}dd, ${color})`,
                  boxShadow: `0 0 10px ${color}50`,
                  opacity: 0.85 + shimmer,
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Wave Reveal (items enter with curved motion) ────────────
export const WaveReveal: React.FC<{
  items: Array<{ icon: string; text: string }>;
  accentColor: string;
  font: string;
  weight: number;
  lineColor?: string;
}> = ({ items, accentColor, font, weight, lineColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const effectiveLineColor = lineColor || accentColor;

  // Vertical connector line
  const lineProgress = spring({ frame: Math.max(0, frame - 5), fps, config: SPRING.SMOOTH });
  const totalHeight = items.length * 80;

  const itemColors = [accentColor, '#84cc16', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={{
      display: 'flex', position: 'relative',
      padding: '20px 60px',
      width: '100%', height: '100%',
      alignItems: 'center',
    }}>
      {/* Vertical connecting line */}
      <div style={{
        position: 'absolute',
        left: 88,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 2,
        height: totalHeight * lineProgress,
        background: `linear-gradient(180deg, transparent, ${effectiveLineColor}40, transparent)`,
        borderRadius: 1,
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 20,
        width: '100%',
      }}>
        {items.map((item, i) => {
          const delay = STAGGER.SLOW + i * STAGGER.SLOW;
          const enter = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.BOUNCY });
          const noiseY = noise3D('wave-y', i, 0, frame * 0.02) * 6;
          const color = itemColors[i % itemColors.length];

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 20,
              opacity: enter,
              transform: `translateX(${interpolate(enter, [0, 1], [-50, 0])}px) translateY(${noiseY}px)`,
            }}>
              {/* Dot on the line */}
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: color,
                boxShadow: `0 0 10px ${color}60`,
                flexShrink: 0,
                border: '2px solid #0A0A0A',
              }} />

              {item.icon && (
                <div style={{
                  fontSize: 32, minWidth: 44,
                  filter: `drop-shadow(0 0 8px ${color}40)`,
                }}>
                  {item.icon}
                </div>
              )}

              <div style={{
                fontSize: 18, fontFamily: font, fontWeight: weight,
                color: '#fff',
                textShadow: `0 0 15px ${color}20`,
              }}>
                {item.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Timeline Layout (vertical with drawn connectors) ────────
export const TimelineLayout: React.FC<{
  items: Array<{ icon: string; text: string }>;
  accentColor: string;
  font: string;
  weight: number;
}> = ({ items, accentColor, font, weight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line draw-in
  const lineEnter = spring({ frame: Math.max(0, frame - 3), fps, config: SPRING.SMOOTH });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 0,
      padding: '20px 80px', height: '100%', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: 104, top: '15%',
        width: 2, height: `${70 * lineEnter}%`,
        background: `linear-gradient(180deg, ${accentColor}60, ${accentColor}20, transparent)`,
      }} />

      {items.map((item, i) => {
        const delay = STAGGER.DRAMATIC + i * STAGGER.SLOW;
        const enter = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.BOUNCY });
        const highlightColor = interpolateColors(
          Math.max(0, frame - delay),
          [0, 15, 30],
          [`${accentColor}00`, accentColor, `${accentColor}80`],
        );

        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '14px 0',
            opacity: enter,
            transform: `translateX(${interpolate(enter, [0, 1], [-20, 0])}px)`,
          }}>
            {/* Node circle */}
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: highlightColor,
              boxShadow: `0 0 12px ${accentColor}40`,
              flexShrink: 0,
              border: '2px solid #0A0A0A',
            }} />

            <div style={{
              fontSize: 17, fontFamily: font, fontWeight: 600,
              color: '#e0e0e0',
              lineHeight: 1.4,
            }}>
              {item.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
