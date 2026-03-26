import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import {
  getFontFamily, getFontWeight, GradientBg, RadialGlow, Particles, GridPattern, GlowCard,
  GradientText, NeonText, AnimatedDivider, FloatingShapes, MorphingShape, AnimatedCircle,
  AnimatedTriangle, AnimatedProgressBar, AnimatedDonutRing, AnimatedBarChart,
  SVGDecorationCluster, ExpandingRing, StaggeredReveal,
} from './shared';

interface Props { scenes: SceneData[]; fontStyle: FontStyle; }

export const ProductLaunch: React.FC<Props> = ({ scenes, fontStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const font = getFontFamily(fontStyle);
  const weight = getFontWeight(fontStyle);
  const TRANSITION_FRAMES = Math.round(fps * 0.5);
  const transitionOverlap = (scenes.length - 1) * TRANSITION_FRAMES;
  const sceneDuration = Math.floor((durationInFrames + transitionOverlap) / scenes.length);

  const T = TRANSITION_FRAMES;
  const timing = linearTiming({ durationInFrames: T });

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <HeroSlide scene={scenes[0]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: 'from-left' })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <FeatureGridSlide scene={scenes[1]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <MetricsSlide scene={scenes[2]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
        </TransitionSeries.Sequence>
        {scenes.length > 3 && (
          <>
            <TransitionSeries.Transition presentation={wipe({ direction: 'from-left' })} timing={timing} />
            <TransitionSeries.Sequence durationInFrames={sceneDuration}>
              <CTASlide scene={scenes[3]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
            </TransitionSeries.Sequence>
          </>
        )}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

function HeroSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const subtitleProgress = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 60 } });
  const glowPulse = 0.25 + Math.sin(frame * 0.08) * 0.1;

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <GridPattern color={scene.accentColor} opacity={0.04} />
      <Particles color={`${scene.accentColor}30`} count={25} seed={1} />
      <FloatingShapes color={scene.accentColor} />
      <RadialGlow color={scene.accentColor} size={900} opacity={glowPulse} />
      <MorphingShape color={scene.accentColor} size={140} fromShape="circle" toShape="star" x="80%" y="25%" />
      <AnimatedCircle color={scene.accentColor} radius={45} x="15%" y="70%" />

      <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
        width: interpolate(frame, [0, 20], [0, 120], { extrapolateRight: 'clamp' }),
        height: 3, borderRadius: 2,
        background: `linear-gradient(90deg, transparent, ${scene.accentColor}, transparent)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${titleScale})`, textAlign: 'center' }}>
          <GradientText from="#FFFFFF" to={scene.accentColor} fontSize={64} fontFamily={font} fontWeight={weight}
            style={{ padding: '0 60px', textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>
        {scene.body && (
          <div style={{ marginTop: 28, transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`, opacity: subtitleProgress, textAlign: 'center' }}>
            <AnimatedDivider color={scene.accentColor} width={80} />
            <p style={{ marginTop: 16, fontFamily: font, fontWeight: 400, fontSize: 26, color: '#A3A3A3', textShadow: `0 0 20px ${scene.accentColor}20` }}>
              {scene.body}
            </p>
            <div style={{ marginTop: 16, width: 200, margin: '16px auto 0' }}>
              <AnimatedProgressBar value={100} color={scene.accentColor} height={3} delay={20} />
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

function FeatureGridSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const items = parseItems(scene.body);
  const glowColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#84cc16', '#ec4899', '#3b82f6'];

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#05051a" />
      <RadialGlow color={scene.accentColor} size={800} opacity={0.12} />
      <Particles color="rgba(139,92,246,0.15)" count={15} seed={42} />
      <AnimatedTriangle color={scene.accentColor} size={35} x="8%" y="15%" />
      <AnimatedCircle color="#06b6d4" radius={30} x="92%" y="80%" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }), marginBottom: 36 }}>
          <GradientText from="#FFFFFF" to={scene.accentColor} fontSize={38} fontFamily={font} fontWeight={weight} style={{ textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: '100%', maxWidth: 1000 }}>
          <StaggeredReveal staggerDelay={4} direction="up">
            {items.slice(0, 6).map((item, i) => {
              const color = glowColors[i % glowColors.length];
              return (
                <div key={i} style={{
                  padding: 20, borderRadius: 16, border: `1.5px solid ${color}80`,
                  background: `linear-gradient(135deg, ${color}15, ${color}06, rgba(10,10,15,0.95))`,
                  boxShadow: `0 0 20px ${color}40, 0 0 50px ${color}15, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minHeight: 110,
                }}>
                  {item.icon && (
                    <div style={{
                      fontSize: 28, width: 50, height: 50, borderRadius: 14,
                      background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                      border: `1px solid ${color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 20px ${color}30`,
                    }}>{item.icon}</div>
                  )}
                  <span style={{ fontFamily: font, fontWeight: 600, fontSize: 16, color: '#F5F5F5', textAlign: 'center' }}>{item.text}</span>
                </div>
              );
            })}
          </StaggeredReveal>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function MetricsSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const items = parseItems(scene.body);
  const mainScale = spring({ frame, fps, config: { damping: 8, stiffness: 50 } });
  const glowPulse = 0.3 + Math.sin(frame * 0.1) * 0.15;

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2={`${scene.accentColor}10`} angle={180} />
      <RadialGlow color={scene.accentColor} size={1000} opacity={glowPulse} />
      <Particles color={`${scene.accentColor}20`} count={20} seed={99} />
      <ExpandingRing color={scene.accentColor} size={200} duration={35} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <AnimatedDonutRing percentage={85} color={scene.accentColor} size={100} label="85%" />
          <div style={{ transform: `scale(${interpolate(mainScale, [0, 1], [0.4, 1])})`, textAlign: 'center' }}>
            <NeonText color={scene.accentColor} fontSize={90} fontFamily={font} fontWeight={weight} glowIntensity={1.5}>
              {scene.headline}
            </NeonText>
          </div>
        </div>

        {items.length > 1 && (
          <div style={{ display: 'flex', gap: 24, marginTop: 36 }}>
            <StaggeredReveal staggerDelay={6} direction="up">
              {items.map((item, i) => (
                <GlowCard key={i} glowColor={scene.accentColor} padding={16} style={{ paddingLeft: 24, paddingRight: 24 }}>
                  <span style={{ fontFamily: font, fontWeight: 500, fontSize: 16, color: '#F5F5F5' }}>
                    {item.icon} {item.text}
                  </span>
                </GlowCard>
              ))}
            </StaggeredReveal>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

function CTASlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const btnPulse = 1 + Math.sin(frame * 0.1) * 0.03;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <RadialGlow color={scene.accentColor} size={600} opacity={0.2} />
      <FloatingShapes color={scene.accentColor} />
      <SVGDecorationCluster color={scene.accentColor} seed={99} />

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
              <span style={{ fontFamily: font, fontWeight: 700, fontSize: 24, color: '#FFFFFF' }}>{scene.body}</span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
