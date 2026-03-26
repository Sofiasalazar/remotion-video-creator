import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import { SPRING, usePulse } from '../lib/animation';
import {
  getFontFamily, getFontWeight, GradientBg, RadialGlow, Particles, GridPattern, GlowCard,
  GradientText, NeonText, AnimatedDivider, FloatingShapes, MorphingShape,
  AnimatedStar, ExpandingRing,
  OrbitLayout, TimelineLayout, ColorShiftGlow,
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
          <OfferingOrbitalSlide scene={scenes[1]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <WhyTimelineSlide scene={scenes[2]} fps={fps} duration={sceneDuration} font={font} weight={weight} />
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
  const scale = spring({ frame, fps, config: SPRING.DRAMATIC });
  const lineWidth = interpolate(scale, [0, 1], [0, 180]);
  const glowPulse = 0.25 + usePulse(0.08, 0.12);

  // Gradient line color shift
  const lineColor = interpolateColors(frame, [0, 25, 50], [scene.accentColor, '#c084fc', scene.accentColor]);

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
          background: `linear-gradient(90deg, transparent, ${lineColor}, transparent)`,
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

// Replaces OfferingGridSlide -- orbital layout with center node and orbiting items
function OfferingOrbitalSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const items = parseItems(scene.body);

  // Split headline: e.g. "The Complete Platform" -> "The Complete" + "Platform"
  const headlineWords = scene.headline.split(' ');
  const lastWord = headlineWords.pop() || '';
  const firstPart = headlineWords.join(' ');

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#050510" />
      <ColorShiftGlow
        colors={['#8b5cf6', '#06b6d4', '#84cc16', '#8b5cf6']}
        size={500}
        opacity={0.08}
      />
      <Particles color="rgba(139,92,246,0.1)" count={12} seed={77} />

      <OrbitLayout
        items={items.slice(0, 6)}
        centerLabel={lastWord || scene.headline}
        accentColor={scene.accentColor}
        font={font}
        weight={weight}
        radius={230}
      />
    </AbsoluteFill>
  );
}

// Replaces WhySlide card list with progress bars -- vertical timeline
function WhyTimelineSlide({ scene, fps, duration, font, weight }: {
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

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Headline */}
        <div style={{ paddingTop: 50, textAlign: 'center' }}>
          <NeonText color="#F5F5F5" fontSize={36} fontFamily={font} fontWeight={weight}
            glowIntensity={0.4} style={{ textAlign: 'center' }}>
            {scene.headline}
          </NeonText>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1 }}>
          <TimelineLayout
            items={items}
            accentColor={scene.accentColor}
            font={font}
            weight={weight}
          />
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
  const pulse = 1 + usePulse(0.1, 0.02);

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
