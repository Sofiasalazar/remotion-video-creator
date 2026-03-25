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
  GridPattern,
  GlowCard,
  GradientText,
  NeonText,
  AnimatedDivider,
  FloatingShapes,
} from './shared';

interface Props {
  scenes: SceneData[];
  fontStyle: FontStyle;
}

export const ProductLaunch: React.FC<Props> = ({ scenes, fontStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const sceneDuration = Math.floor(durationInFrames / scenes.length);
  const font = getFontFamily(fontStyle);
  const weight = getFontWeight(fontStyle);

  return (
    <AbsoluteFill>
      {scenes.map((scene, i) => (
        <Sequence key={i} from={sceneDuration * i} durationInFrames={sceneDuration}>
          {i === 0 && <HeroSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 1 && <FeatureGridSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 2 && <MetricsSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 3 && <CTASlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ── Slide 1: Hero with big headline + subtitle ─────────────── */
function HeroSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const subtitleProgress = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 60 } });
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const glowPulse = 0.25 + Math.sin(frame * 0.08) * 0.1;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <GridPattern color={scene.accentColor} opacity={0.04} />
      <Particles color={`${scene.accentColor}30`} count={25} seed={1} />
      <FloatingShapes color={scene.accentColor} />
      <RadialGlow color={scene.accentColor} size={900} opacity={glowPulse} />

      {/* Decorative top bar */}
      <div style={{
        position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
        width: interpolate(frame, [0, 20], [0, 120], { extrapolateRight: 'clamp' }),
        height: 3, borderRadius: 2,
        background: `linear-gradient(90deg, transparent, ${scene.accentColor}, transparent)`,
      }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${titleScale})`, textAlign: 'center' }}>
          <GradientText from="#FFFFFF" to={scene.accentColor} fontSize={64} fontFamily={font} fontWeight={weight}
            style={{ padding: '0 60px', textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        {scene.body && (
          <div style={{
            marginTop: 28,
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
            opacity: subtitleProgress,
            textAlign: 'center',
          }}>
            <AnimatedDivider color={scene.accentColor} width={80} />
            <p style={{
              marginTop: 16, fontFamily: font, fontWeight: 400, fontSize: 26,
              color: '#A3A3A3', textShadow: `0 0 20px ${scene.accentColor}20`,
            }}>
              {scene.body}
            </p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* ── Slide 2: Feature Card Grid (like the screenshot with 6 glowing cards) ── */
function FeatureGridSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const items = parseItems(scene.body);
  const glowColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#84cc16', '#ec4899', '#3b82f6'];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#05051a" />
      <RadialGlow color={scene.accentColor} size={800} opacity={0.12} />
      <Particles color="rgba(139,92,246,0.15)" count={15} seed={42} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        {/* Title */}
        <div style={{
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
          marginBottom: 36,
        }}>
          <GradientText from="#FFFFFF" to={scene.accentColor} fontSize={38} fontFamily={font} fontWeight={weight}
            style={{ textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        {/* Card grid: 3 columns x 2 rows */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          width: '100%',
          maxWidth: 1000,
        }}>
          {items.slice(0, 6).map((item, i) => {
            const delay = 6 + i * 4;
            const cardProgress = spring({
              frame: Math.max(0, frame - delay), fps,
              config: { damping: 12, stiffness: 80 },
            });
            const color = glowColors[i % glowColors.length];
            return (
              <div key={i} style={{
                opacity: cardProgress,
                transform: `translateY(${interpolate(cardProgress, [0, 1], [30, 0])}px) scale(${interpolate(cardProgress, [0, 1], [0.9, 1])})`,
              }}>
                <div style={{
                  padding: 20,
                  borderRadius: 14,
                  border: `1px solid ${color}50`,
                  background: `linear-gradient(135deg, ${color}08, ${color}03)`,
                  boxShadow: `0 0 25px ${color}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 100,
                }}>
                  {item.icon && (
                    <div style={{
                      fontSize: 28,
                      width: 48, height: 48,
                      borderRadius: 12,
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.icon}
                    </div>
                  )}
                  <span style={{
                    fontFamily: font, fontWeight: 600, fontSize: 16,
                    color: '#F5F5F5', textAlign: 'center',
                  }}>
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

/* ── Slide 3: Metrics / Key Stats ─────────────────────────── */
function MetricsSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const items = parseItems(scene.body);
  const mainScale = spring({ frame, fps, config: { damping: 8, stiffness: 50 } });
  const glowPulse = 0.3 + Math.sin(frame * 0.1) * 0.15;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2={`${scene.accentColor}10`} angle={180} />
      <RadialGlow color={scene.accentColor} size={1000} opacity={glowPulse} />
      <Particles color={`${scene.accentColor}20`} count={20} seed={99} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Big number/headline */}
        <div style={{ transform: `scale(${interpolate(mainScale, [0, 1], [0.4, 1])})`, textAlign: 'center' }}>
          <NeonText color={scene.accentColor} fontSize={100} fontFamily={font} fontWeight={weight} glowIntensity={1.5}>
            {scene.headline}
          </NeonText>
        </div>

        {/* Sub-metrics row */}
        {items.length > 1 && (
          <div style={{ display: 'flex', gap: 24, marginTop: 36 }}>
            {items.map((item, i) => {
              const delay = 12 + i * 6;
              const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 70 } });
              return (
                <div key={i} style={{
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                  textAlign: 'center',
                }}>
                  <GlowCard glowColor={scene.accentColor} padding={16} style={{ paddingLeft: 24, paddingRight: 24 }}>
                    <span style={{ fontFamily: font, fontWeight: 500, fontSize: 16, color: '#F5F5F5' }}>
                      {item.icon} {item.text}
                    </span>
                  </GlowCard>
                </div>
              );
            })}
          </div>
        )}

        {items.length === 1 && (
          <p style={{
            marginTop: 16, fontFamily: font, fontWeight: 400, fontSize: 24,
            color: '#A3A3A3', textAlign: 'center',
            opacity: interpolate(frame, [10, 22], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            {items[0].text}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* ── Slide 4: CTA ─────────────────────────────────────────── */
function CTASlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [duration - 18, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const btnPulse = 1 + Math.sin(frame * 0.1) * 0.03;

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <RadialGlow color={scene.accentColor} size={600} opacity={0.2} />
      <FloatingShapes color={scene.accentColor} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <NeonText color="#F5F5F5" fontSize={50} fontFamily={font} fontWeight={weight} glowIntensity={0.6}>
          {scene.headline}
        </NeonText>

        {scene.body && (
          <div style={{ transform: `scale(${btnPulse})` }}>
            <div style={{
              padding: '16px 48px', borderRadius: 50,
              background: `linear-gradient(135deg, ${scene.accentColor}, ${scene.accentColor}cc)`,
              boxShadow: `0 0 40px ${scene.accentColor}40, 0 0 80px ${scene.accentColor}15`,
            }}>
              <span style={{ fontFamily: font, fontWeight: 700, fontSize: 24, color: '#FFFFFF' }}>
                {scene.body}
              </span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
