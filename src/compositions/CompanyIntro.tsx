import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import {
  getFontFamily, getFontWeight, GradientBg, RadialGlow, Particles, GridPattern, GlowCard,
  GradientText, NeonText, AnimatedDivider, FloatingShapes, MorphingShape, AnimatedCircle,
  AnimatedTriangle, AnimatedStar, AnimatedProgressBar, SVGDecorationCluster, ExpandingRing,
  StaggeredReveal,
} from './shared';

interface Props { scenes: SceneData[]; fontStyle: FontStyle; }

export const CompanyIntro: React.FC<Props> = ({ scenes, fontStyle }) => {
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
          <BrandSlide scene={scenes[0]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: 'from-right' })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <OfferingGridSlide scene={scenes[1]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <WhySlide scene={scenes[2]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
        </TransitionSeries.Sequence>
        {scenes.length > 3 && (
          <>
            <TransitionSeries.Transition presentation={fade()} timing={timing} />
            <TransitionSeries.Sequence durationInFrames={sceneDuration}>
              <ContactSlide scene={scenes[3]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
            </TransitionSeries.Sequence>
          </>
        )}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

function BrandSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 60 } });
  const lineWidth = interpolate(scale, [0, 1], [0, 180]);
  const glowPulse = 0.25 + Math.sin(frame * 0.08) * 0.12;

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0f0520" angle={135} />
      <GridPattern color={scene.accentColor} opacity={0.03} />
      <RadialGlow color={scene.accentColor} size={800} opacity={glowPulse} />
      <Particles color={`${scene.accentColor}20`} count={20} seed={5} />
      <ExpandingRing color={scene.accentColor} size={200} duration={30} />
      <MorphingShape color={scene.accentColor} size={130} fromShape="rect" toShape="circle" x="50%" y="50%" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${interpolate(scale, [0, 1], [0.3, 1])})`, opacity: scale }}>
          <GradientText from="#FFFFFF" to={scene.accentColor} fontSize={76} fontFamily={font} fontWeight={weight}
            style={{ textAlign: 'center', letterSpacing: 4 }}>
            {scene.headline}
          </GradientText>
        </div>

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

function OfferingGridSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const items = parseItems(scene.body);
  const glowColors = ['#f59e0b', '#eab308', '#06b6d4', '#84cc16', '#3b82f6', '#8b5cf6'];

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#050510" />
      <RadialGlow color="#8b5cf6" size={900} opacity={0.08} />
      <Particles color="rgba(139,92,246,0.1)" count={12} seed={77} />
      <AnimatedTriangle color="#06b6d4" size={30} x="5%" y="12%" />
      <AnimatedCircle color="#84cc16" radius={25} x="95%" y="85%" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36 }}>
        <div style={{ opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }), marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontFamily: font, fontWeight: 600, fontSize: 22, color: '#F5F5F5', marginBottom: 4 }}>
            {scene.headline.split(' ').slice(0, -1).join(' ') || scene.headline}
          </div>
          <GradientText from="#8b5cf6" to="#c084fc" fontSize={36} fontFamily={font} fontWeight={weight} style={{ textAlign: 'center' }}>
            {scene.headline.split(' ').pop() || ''}
          </GradientText>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: '100%', maxWidth: 1050 }}>
          <StaggeredReveal staggerDelay={3} direction="scale">
            {items.slice(0, 6).map((item, i) => {
              const color = glowColors[i % glowColors.length];
              return (
                <div key={i} style={{
                  padding: 18, borderRadius: 14, border: `1px solid ${color}35`,
                  background: `linear-gradient(145deg, ${color}06, ${color}02, transparent)`,
                  boxShadow: `0 0 20px ${color}12, 0 0 40px ${color}06, inset 0 1px 0 rgba(255,255,255,0.03)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minHeight: 100, justifyContent: 'center',
                }}>
                  {item.icon && (
                    <div style={{
                      fontSize: 26, width: 44, height: 44, borderRadius: 12,
                      background: `${color}12`, border: `1px solid ${color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${color}15`,
                    }}>{item.icon}</div>
                  )}
                  <span style={{ fontFamily: font, fontWeight: 600, fontSize: 14, color: '#F5F5F5', textAlign: 'center', lineHeight: 1.3 }}>{item.text}</span>
                </div>
              );
            })}
          </StaggeredReveal>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function WhySlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const items = parseItems(scene.body);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <GradientBg color1="#0A0A0A" color2={`${scene.accentColor}08`} angle={135} />
      <RadialGlow color={scene.accentColor} size={600} opacity={0.15} />
      <Particles color={`${scene.accentColor}15`} count={12} seed={66} />
      <SVGDecorationCluster color={scene.accentColor} seed={88} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        <NeonText color="#F5F5F5" fontSize={38} fontFamily={font} fontWeight={weight}
          glowIntensity={0.4} style={{ textAlign: 'center', marginBottom: 36 }}>
          {scene.headline}
        </NeonText>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 700, width: '100%' }}>
          <StaggeredReveal staggerDelay={6} direction="left">
            {items.map((item, i) => (
              <GlowCard key={i} glowColor={scene.accentColor} padding={16}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', backgroundColor: scene.accentColor,
                    boxShadow: `0 0 10px ${scene.accentColor}60`, flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: font, fontWeight: 500, fontSize: 20, color: '#F5F5F5', flex: 1 }}>
                    {item.icon} {item.text}
                  </span>
                  <AnimatedProgressBar value={80 + i * 5} color={scene.accentColor} height={3} width={100} delay={8 + i * 6} />
                </div>
              </GlowCard>
            ))}
          </StaggeredReveal>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ContactSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const pulse = 1 + Math.sin(frame * 0.1) * 0.02;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <RadialGlow color={scene.accentColor} size={500} opacity={0.2} />
      <FloatingShapes color={scene.accentColor} />
      <AnimatedStar color={scene.accentColor} size={22} x="30%" y="25%" />
      <AnimatedStar color={scene.accentColor} size={18} x="70%" y="75%" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <NeonText color="#F5F5F5" fontSize={42} fontFamily={font} fontWeight={weight}
          glowIntensity={0.5} style={{ textAlign: 'center', marginBottom: 20 }}>
          {scene.headline}
        </NeonText>

        <AnimatedDivider color={scene.accentColor} width={80} />

        {scene.body && (
          <div style={{ marginTop: 24, transform: `scale(${pulse})` }}>
            <GlowCard glowColor={scene.accentColor} padding={16} style={{ paddingLeft: 40, paddingRight: 40 }}>
              <span style={{ fontFamily: font, fontWeight: 600, fontSize: 24, color: scene.accentColor }}>{scene.body}</span>
            </GlowCard>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
