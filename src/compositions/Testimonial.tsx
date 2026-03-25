import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import {
  getFontFamily,
  getFontWeight,
  GradientBg,
  RadialGlow,
  Particles,
  GlowCard,
  NeonText,
  GradientText,
  AnimatedDivider,
  FloatingShapes,
} from './shared';

interface Props {
  scenes: SceneData[];
  fontStyle: FontStyle;
}

export const Testimonial: React.FC<Props> = ({ scenes, fontStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const sceneDuration = Math.floor(durationInFrames / scenes.length);
  const font = getFontFamily(fontStyle);
  const weight = getFontWeight(fontStyle);

  return (
    <AbsoluteFill>
      {scenes.map((scene, i) => (
        <Sequence key={i} from={sceneDuration * i} durationInFrames={sceneDuration}>
          {i === 0 && <QuoteSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 1 && <ResultsSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 2 && <AttributionSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ── Quote slide with large decorative marks + card ───────── */
function QuoteSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const quoteScale = spring({ frame, fps, config: { damping: 14, stiffness: 60 } });
  const cardProgress = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 12, stiffness: 70 } });

  // Word-by-word reveal for the headline
  const words = scene.headline.split(' ');

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0a0a15" />
      <RadialGlow color={scene.accentColor} size={600} x="30%" y="40%" opacity={0.12} />
      <RadialGlow color="#06b6d4" size={400} x="70%" y="60%" opacity={0.06} />
      <Particles color={`${scene.accentColor}12`} count={12} seed={33} />

      {/* Large decorative quotes */}
      <div style={{
        position: 'absolute', top: '8%', left: '6%',
        fontSize: 220, fontFamily: 'Georgia, serif', color: scene.accentColor,
        opacity: interpolate(quoteScale, [0, 1], [0, 0.1]), lineHeight: 1,
        transform: `scale(${quoteScale})`,
      }}>{'\u201C'}</div>
      <div style={{
        position: 'absolute', bottom: '8%', right: '6%',
        fontSize: 220, fontFamily: 'Georgia, serif', color: scene.accentColor,
        opacity: interpolate(quoteScale, [0, 1], [0, 0.07]), lineHeight: 1,
      }}>{'\u201D'}</div>

      {/* Vertical accent */}
      <div style={{
        position: 'absolute', left: '11%', top: '25%', width: 3, borderRadius: 2,
        height: interpolate(frame, [5, 20], [0, 200], { extrapolateRight: 'clamp' }),
        background: `linear-gradient(180deg, ${scene.accentColor}40, transparent)`,
      }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        <div style={{
          opacity: cardProgress,
          transform: `translateY(${interpolate(cardProgress, [0, 1], [20, 0])}px)`,
        }}>
          <GlowCard glowColor={scene.accentColor} padding={36} style={{ maxWidth: 900 }}>
            {/* Quote text word-by-word */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: scene.body ? 16 : 0 }}>
              {words.map((word, i) => {
                const delay = 10 + i * 2;
                const wordOpacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateRight: 'clamp' });
                return (
                  <span key={i} style={{
                    fontFamily: font, fontWeight: weight, fontSize: 32,
                    color: '#F5F5F5', opacity: wordOpacity, lineHeight: 1.5,
                    fontStyle: font.includes('Georgia') ? 'italic' : 'normal',
                  }}>{word}</span>
                );
              })}
            </div>

            {/* Sub-quote */}
            {scene.body && !scene.body.includes('|') && (
              <div style={{
                fontFamily: font, fontWeight: 400, fontSize: 20, color: '#A3A3A3',
                textAlign: 'center',
                opacity: interpolate(frame, [duration * 0.5, duration * 0.65], [0, 1], { extrapolateRight: 'clamp' }),
              }}>
                {scene.body}
              </div>
            )}
          </GlowCard>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Results slide with metric cards ──────────────────────── */
function ResultsSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const items = parseItems(scene.body);
  const colors = ['#8b5cf6', '#84cc16', '#06b6d4', '#f59e0b'];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0a0f0a" />
      <RadialGlow color={scene.accentColor} size={700} opacity={0.15} />
      <Particles color={`${scene.accentColor}15`} count={15} seed={88} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
          marginBottom: 36,
        }}>
          <GradientText from="#F5F5F5" to={scene.accentColor} fontSize={38} fontFamily={font} fontWeight={weight}
            style={{ textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        {/* 2x2 metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 700, width: '100%' }}>
          {items.slice(0, 4).map((item, i) => {
            const delay = 8 + i * 5;
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 80 } });
            const color = colors[i % colors.length];
            return (
              <div key={i} style={{
                opacity: p, transform: `translateY(${interpolate(p, [0, 1], [25, 0])}px)`,
              }}>
                <div style={{
                  padding: 18, borderRadius: 14,
                  border: `1px solid ${color}40`,
                  background: `linear-gradient(135deg, ${color}08, transparent)`,
                  boxShadow: `0 0 25px ${color}10`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  {item.icon && (
                    <div style={{
                      fontSize: 22, width: 40, height: 40, borderRadius: 10,
                      background: `${color}15`, border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{item.icon}</div>
                  )}
                  <span style={{ fontFamily: font, fontWeight: 600, fontSize: 16, color: '#F5F5F5' }}>
                    {item.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Attribution slide ────────────────────────────────────── */
function AttributionSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const slideUp = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const fadeOut = interpolate(frame, [duration - 12, duration], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0a0a15" />
      <RadialGlow color={scene.accentColor} size={400} opacity={0.2} />
      <FloatingShapes color={scene.accentColor} />

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transform: `translateY(${interpolate(slideUp, [0, 1], [40, 0])}px)`, opacity: slideUp,
      }}>
        {/* Avatar circle */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${scene.accentColor}40, ${scene.accentColor}15)`,
          border: `2px solid ${scene.accentColor}50`,
          boxShadow: `0 0 30px ${scene.accentColor}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <span style={{ fontSize: 32, color: scene.accentColor }}>
            {scene.headline.charAt(0).toUpperCase()}
          </span>
        </div>

        <AnimatedDivider color={scene.accentColor} width={60} />

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <NeonText color="#F5F5F5" fontSize={34} fontFamily={font} fontWeight={weight} glowIntensity={0.4}>
            {scene.headline}
          </NeonText>
        </div>

        {scene.body && (
          <p style={{
            fontFamily: font, fontWeight: 400, fontSize: 20, color: '#A3A3A3',
            textAlign: 'center', marginTop: 8,
            opacity: interpolate(frame, [12, 22], [0, 1], { extrapolateRight: 'clamp' }),
          }}>{scene.body}</p>
        )}
      </div>
    </AbsoluteFill>
  );
}
