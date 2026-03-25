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

export const CompanyIntro: React.FC<Props> = ({ scenes, fontStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const sceneDuration = Math.floor(durationInFrames / scenes.length);
  const font = getFontFamily(fontStyle);
  const weight = getFontWeight(fontStyle);

  return (
    <AbsoluteFill>
      {scenes.map((scene, i) => (
        <Sequence key={i} from={sceneDuration * i} durationInFrames={sceneDuration}>
          {i === 0 && <BrandSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 1 && <OfferingGridSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 2 && <WhySlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 3 && <ContactSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ── Brand name with scale-in and glow ────────────────────── */
function BrandSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 60 } });
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const lineWidth = interpolate(scale, [0, 1], [0, 180]);
  const glowPulse = 0.25 + Math.sin(frame * 0.08) * 0.12;
  const ringScale = interpolate(frame, [0, 30], [0.8, 2], { extrapolateRight: 'clamp' });
  const ringOpacity = interpolate(frame, [0, 30], [0.2, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0f0520" angle={135} />
      <GridPattern color={scene.accentColor} opacity={0.03} />
      <RadialGlow color={scene.accentColor} size={800} opacity={glowPulse} />
      <Particles color={`${scene.accentColor}20`} count={20} seed={5} />

      {/* Expanding ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 200, height: 200,
        borderRadius: '50%', border: `2px solid ${scene.accentColor}`,
        transform: `translate(-50%, -50%) scale(${ringScale})`, opacity: ringOpacity,
      }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${interpolate(scale, [0, 1], [0.3, 1])})`, opacity: scale }}>
          <GradientText from="#FFFFFF" to={scene.accentColor} fontSize={76} fontFamily={font} fontWeight={weight}
            style={{ textAlign: 'center', letterSpacing: 4 }}>
            {scene.headline}
          </GradientText>
        </div>

        {/* Glowing underline */}
        <div style={{
          marginTop: 24, width: lineWidth, height: 4, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${scene.accentColor}, transparent)`,
          boxShadow: `0 0 20px ${scene.accentColor}40`,
        }} />

        {scene.body && !scene.body.includes('|') && (
          <p style={{
            marginTop: 20, fontFamily: font, fontWeight: 400, fontSize: 24, color: '#A3A3A3',
            opacity: interpolate(frame, [15, 28], [0, 1], { extrapolateRight: 'clamp' }),
          }}>{scene.body}</p>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* ── Offering Grid: 3x2 card grid exactly like the screenshot ── */
function OfferingGridSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const items = parseItems(scene.body);
  // Different glow colors per card (like the screenshot)
  const glowColors = ['#f59e0b', '#eab308', '#06b6d4', '#84cc16', '#3b82f6', '#8b5cf6'];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#050510" />
      <RadialGlow color="#8b5cf6" size={900} opacity={0.08} />
      <Particles color="rgba(139,92,246,0.1)" count={12} seed={77} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36 }}>
        {/* Title with gradient like "Arquitecto de Software IA" */}
        <div style={{
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
          marginBottom: 32, textAlign: 'center',
        }}>
          <div style={{ fontFamily: font, fontWeight: 600, fontSize: 22, color: '#F5F5F5', marginBottom: 4 }}>
            {scene.headline.split(' ').slice(0, -1).join(' ') || scene.headline}
          </div>
          <GradientText from="#8b5cf6" to="#c084fc" fontSize={36} fontFamily={font} fontWeight={weight}
            style={{ textAlign: 'center' }}>
            {scene.headline.split(' ').pop() || ''}
          </GradientText>
        </div>

        {/* 3x2 card grid with different glow colors */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14, width: '100%', maxWidth: 1050,
        }}>
          {items.slice(0, 6).map((item, i) => {
            const delay = 6 + i * 3;
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 80 } });
            const color = glowColors[i % glowColors.length];
            return (
              <div key={i} style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [25, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
              }}>
                <div style={{
                  padding: 18, borderRadius: 14,
                  border: `1px solid ${color}35`,
                  background: `linear-gradient(145deg, ${color}06, ${color}02, transparent)`,
                  boxShadow: `
                    0 0 20px ${color}12,
                    0 0 40px ${color}06,
                    inset 0 1px 0 rgba(255,255,255,0.03)
                  `,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 10, minHeight: 100, justifyContent: 'center',
                }}>
                  {item.icon && (
                    <div style={{
                      fontSize: 26, width: 44, height: 44, borderRadius: 12,
                      background: `${color}12`, border: `1px solid ${color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 15px ${color}15`,
                    }}>
                      {item.icon}
                    </div>
                  )}
                  <span style={{
                    fontFamily: font, fontWeight: 600, fontSize: 14, color: '#F5F5F5',
                    textAlign: 'center', lineHeight: 1.3,
                  }}>{item.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Why Us slide with list cards ─────────────────────────── */
function WhySlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const items = parseItems(scene.body);

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <GradientBg color1="#0A0A0A" color2={`${scene.accentColor}08`} angle={135} />
      <RadialGlow color={scene.accentColor} size={600} opacity={0.15} />
      <Particles color={`${scene.accentColor}15`} count={12} seed={66} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        <NeonText color="#F5F5F5" fontSize={38} fontFamily={font} fontWeight={weight}
          glowIntensity={0.4} style={{ textAlign: 'center', marginBottom: 36 }}>
          {scene.headline}
        </NeonText>

        {/* List items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 700, width: '100%' }}>
          {items.map((item, i) => {
            const delay = 8 + i * 6;
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 70 } });
            return (
              <div key={i} style={{
                opacity: p, transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
              }}>
                <GlowCard glowColor={scene.accentColor} padding={16}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: scene.accentColor,
                      boxShadow: `0 0 10px ${scene.accentColor}60`,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontFamily: font, fontWeight: 500, fontSize: 20, color: '#F5F5F5' }}>
                      {item.icon} {item.text}
                    </span>
                  </div>
                </GlowCard>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Contact CTA ──────────────────────────────────────────── */
function ContactSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [duration - 22, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const pulse = 1 + Math.sin(frame * 0.1) * 0.02;

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <RadialGlow color={scene.accentColor} size={500} opacity={0.2} />
      <FloatingShapes color={scene.accentColor} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <NeonText color="#F5F5F5" fontSize={42} fontFamily={font} fontWeight={weight}
          glowIntensity={0.5} style={{ textAlign: 'center', marginBottom: 20 }}>
          {scene.headline}
        </NeonText>

        <AnimatedDivider color={scene.accentColor} width={80} />

        {scene.body && (
          <div style={{ marginTop: 24, transform: `scale(${pulse})` }}>
            <GlowCard glowColor={scene.accentColor} padding={16} style={{ paddingLeft: 40, paddingRight: 40 }}>
              <span style={{ fontFamily: font, fontWeight: 600, fontSize: 24, color: scene.accentColor }}>
                {scene.body}
              </span>
            </GlowCard>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
