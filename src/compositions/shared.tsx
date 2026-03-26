import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { makeCircle, makeStar, makeTriangle, makeRect } from '@remotion/shapes';
import { evolvePath, interpolatePath } from '@remotion/paths';
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
  const progress = spring({ frame, fps, config: { damping: 14, stiffness: 60 } });
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
  const progress = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
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
  const progress = spring({ frame, fps, config: { damping: 10, stiffness: 60 } });
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
  const progress = spring({ frame, fps, config: { damping: 14, stiffness: 40 } });

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
        pointerEvents: 'none', opacity: 0.35,
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
          fps, config: { damping: 14, stiffness: 60 },
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
              pointerEvents: 'none', opacity: 0.4,
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
  value: number; // 0-100
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
    config: { damping: 20, stiffness: 50 },
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
      <div style={{ width: '100%', height, backgroundColor: '#1a1a1a', borderRadius: height / 2, overflow: 'hidden' }}>
        <div style={{
          width: `${fillWidth}%`, height: '100%', borderRadius: height / 2,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          boxShadow: `0 0 10px ${color}40`,
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
          frame: Math.max(0, frame - 5 - i * 5), fps,
          config: { damping: 14, stiffness: 60 },
        });
        const barHeight = interpolate(progress, [0, 1], [0, (bar.value / maxVal) * height * 0.85]);
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: barWidth, height: barHeight, borderRadius: 6,
              background: `linear-gradient(180deg, ${bar.color}, ${bar.color}80)`,
              boxShadow: `0 0 15px ${bar.color}25`,
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
  const progress = spring({ frame, fps, config: { damping: 18, stiffness: 40 } });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillAmount = interpolate(progress, [0, 1], [circumference, circumference * (1 - percentage / 100)]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a1a1a" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={fillAmount}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
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
}> = ({ children, staggerDelay = 4, direction = 'up' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {React.Children.map(children, (child, i) => {
        const p = spring({
          frame: Math.max(0, frame - i * staggerDelay), fps,
          config: { damping: 12, stiffness: 80 },
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
