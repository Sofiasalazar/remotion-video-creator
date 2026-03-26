import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import { SPRING, usePulse } from '../lib/animation';
import { noise3D } from '@remotion/noise';
import {
  getFontFamily, getFontWeight, GradientBg, RadialGlow, Particles, NeonText, GradientText,
  FloatingShapes, AnimatedStar, MorphingShape, AnimatedCircle,
  WaveReveal, ColorShiftGlow,
} from './shared';

interface Props { scenes: SceneData[]; fontStyle: FontStyle; }

export const SocialMediaPromo: React.FC<Props> = ({ scenes, fontStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const font = getFontFamily(fontStyle);
  const weight = getFontWeight(fontStyle);
  const TRANSITION_FRAMES = Math.round(fps * 0.5);
  const transitionOverlap = (scenes.length - 1) * TRANSITION_FRAMES;
  const sceneDuration = Math.floor((durationInFrames + transitionOverlap) / scenes.length);

  return (
    <AbsoluteFill>
      <TransitionSeries>
        {scenes.map((scene, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={sceneDuration}>
              {i === 0 && <HookSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
              {i === 1 && <ValueWaveSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
              {i === 2 && <CTASlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })} />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

function HookSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const bounce = spring({ frame, fps, config: SPRING.BOUNCY });
  const glowPulse = 0.4 + usePulse(0.12, 0.15);
  const lineW1 = interpolate(frame, [0, 20], [0, 200], { extrapolateRight: 'clamp' });
  const lineW2 = interpolate(frame, [5, 25], [0, 150], { extrapolateRight: 'clamp' });

  // Noise-based subtle headline wobble
  const wobbleRotation = noise3D('hook-wobble', 0, 0, frame * 0.03) * 1.5;

  // Glow color shifts between accent and cyan
  const glowColor = interpolateColors(frame, [0, 30, 60], [scene.accentColor, '#06b6d4', scene.accentColor]);

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#1a0a2e" angle={135} />
      <RadialGlow color={glowColor} size={900} opacity={glowPulse} />
      <RadialGlow color="#06b6d4" size={500} x="80%" y="20%" opacity={0.1} />
      <Particles color={`${scene.accentColor}35`} count={30} seed={7} />
      <MorphingShape color={scene.accentColor} size={150} fromShape="circle" toShape="star" x="75%" y="30%" />
      <AnimatedCircle color={scene.accentColor} radius={50} x="15%" y="75%" />

      <div style={{ position: 'absolute', top: '18%', left: '5%', width: lineW1, height: 2,
        background: `linear-gradient(90deg, ${scene.accentColor}60, transparent)` }} />
      <div style={{ position: 'absolute', bottom: '18%', right: '5%', width: lineW2, height: 2,
        background: `linear-gradient(270deg, ${scene.accentColor}60, transparent)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          transform: `scale(${bounce}) rotate(${wobbleRotation}deg)`,
          textAlign: 'center',
        }}>
          <NeonText color="#F5F5F5" fontSize={72} fontFamily={font} fontWeight={weight} glowIntensity={1.2}>
            {scene.headline}
          </NeonText>
        </div>
        {scene.body && !scene.body.includes('|') && (
          <div style={{
            fontFamily: font, fontWeight: 400, fontSize: 28, color: '#A3A3A3', textAlign: 'center', marginTop: 28,
            opacity: interpolate(frame, [15, 28], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(frame, [15, 28], [20, 0], { extrapolateRight: 'clamp' })}px)`,
          }}>{scene.body}</div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// Replaces ValueGridSlide -- wave reveal with curved motion paths
function ValueWaveSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const items = parseItems(scene.body);

  // Headline fade
  const headlineOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0f0a" angle={180} />
      <ColorShiftGlow
        colors={['#84cc16', '#06b6d4', '#8b5cf6']}
        size={600}
        opacity={0.12}
        x="30%"
        y="55%"
      />
      <Particles color="rgba(132,204,22,0.15)" count={15} seed={55} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Headline */}
        <div style={{
          paddingTop: 40, textAlign: 'center',
          opacity: headlineOpacity,
        }}>
          <GradientText from="#F5F5F5" to={scene.accentColor} fontSize={34} fontFamily={font} fontWeight={weight} style={{ textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        {/* Wave reveal area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <WaveReveal
            items={items.slice(0, 4)}
            accentColor={scene.accentColor}
            font={font}
            weight={weight}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CTASlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const slideUp = spring({ frame, fps, config: SPRING.SMOOTH });
  const pulse = 1 + usePulse(0.12, 0.03);

  // CTA glow color
  const ctaGlow = interpolateColors(frame, [0, 30, 60], [scene.accentColor, '#84cc16', scene.accentColor]);

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#1a0a2e" />
      <RadialGlow color={ctaGlow} size={500} opacity={0.25} />
      <FloatingShapes color={scene.accentColor} />
      <AnimatedStar color={scene.accentColor} size={25} x="25%" y="35%" />
      <AnimatedStar color={scene.accentColor} size={20} x="75%" y="65%" />

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: `translateY(${interpolate(slideUp, [0, 1], [50, 0])}px)`, opacity: slideUp,
      }}>
        <NeonText color="#F5F5F5" fontSize={50} fontFamily={font} fontWeight={weight} glowIntensity={0.8} style={{ textAlign: 'center', marginBottom: 28 }}>
          {scene.headline}
        </NeonText>
        {scene.body && (
          <div style={{ transform: `scale(${pulse})` }}>
            <div style={{
              padding: '16px 48px', borderRadius: 50,
              background: `linear-gradient(135deg, ${scene.accentColor}, ${scene.accentColor}cc)`,
              boxShadow: `0 0 40px ${ctaGlow}40, 0 0 80px ${ctaGlow}15`,
            }}>
              <span style={{ fontFamily: font, fontWeight: 700, fontSize: 22, color: '#FFFFFF' }}>{scene.body}</span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
