import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import {
  getFontFamily, getFontWeight, GradientBg, RadialGlow, Particles, NeonText, GradientText,
  GlowCard, FloatingShapes, AnimatedStar, AnimatedProgressBar, MorphingShape,
  SVGDecorationCluster, AnimatedCircle,
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
              {i === 1 && <ValueGridSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
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
  const bounce = spring({ frame, fps, config: { damping: 6, stiffness: 100, mass: 0.8 } });
  const glowPulse = 0.4 + Math.sin(frame * 0.12) * 0.15;
  const lineW1 = interpolate(frame, [0, 20], [0, 200], { extrapolateRight: 'clamp' });
  const lineW2 = interpolate(frame, [5, 25], [0, 150], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#1a0a2e" angle={135} />
      <RadialGlow color={scene.accentColor} size={900} opacity={glowPulse} />
      <RadialGlow color="#06b6d4" size={500} x="80%" y="20%" opacity={0.1} />
      <Particles color={`${scene.accentColor}35`} count={30} seed={7} />
      <MorphingShape color={scene.accentColor} size={150} fromShape="circle" toShape="star" x="75%" y="30%" />
      <AnimatedCircle color={scene.accentColor} radius={50} x="15%" y="75%" />

      <div style={{ position: 'absolute', top: '18%', left: '5%', width: lineW1, height: 2,
        background: `linear-gradient(90deg, ${scene.accentColor}60, transparent)` }} />
      <div style={{ position: 'absolute', bottom: '18%', right: '5%', width: lineW2, height: 2,
        background: `linear-gradient(270deg, ${scene.accentColor}60, transparent)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${bounce})`, textAlign: 'center' }}>
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

function ValueGridSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const items = parseItems(scene.body);
  const colors = ['#8b5cf6', '#84cc16', '#06b6d4', '#f59e0b'];

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0f0a" angle={180} />
      <RadialGlow color={scene.accentColor} size={700} opacity={0.15} />
      <Particles color="rgba(132,204,22,0.15)" count={15} seed={55} />
      <SVGDecorationCluster color={scene.accentColor} seed={44} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }), marginBottom: 32 }}>
          <GradientText from="#F5F5F5" to={scene.accentColor} fontSize={36} fontFamily={font} fontWeight={weight} style={{ textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%', maxWidth: 750 }}>
          {items.slice(0, 4).map((item, i) => {
            const delay = 6 + i * 5;
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 80 } });
            const color = colors[i % colors.length];
            return (
              <div key={i} style={{
                opacity: p, transform: `translateY(${interpolate(p, [0, 1], [25, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
              }}>
                <div style={{
                  padding: 18, borderRadius: 14, border: `1px solid ${color}40`,
                  background: `linear-gradient(135deg, ${color}08, transparent)`,
                  boxShadow: `0 0 30px ${color}12`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                    {item.icon && (
                      <div style={{
                        fontSize: 24, width: 44, height: 44, borderRadius: 10,
                        background: `${color}15`, border: `1px solid ${color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{item.icon}</div>
                    )}
                    <span style={{ fontFamily: font, fontWeight: 600, fontSize: 18, color: '#F5F5F5' }}>{item.text}</span>
                  </div>
                  <AnimatedProgressBar value={60 + i * 10} color={color} height={3} delay={delay + 8} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CTASlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const slideUp = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const pulse = 1 + Math.sin(frame * 0.12) * 0.03;

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#1a0a2e" />
      <RadialGlow color={scene.accentColor} size={500} opacity={0.25} />
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
              boxShadow: `0 0 40px ${scene.accentColor}40, 0 0 80px ${scene.accentColor}15`,
            }}>
              <span style={{ fontFamily: font, fontWeight: 700, fontSize: 22, color: '#FFFFFF' }}>{scene.body}</span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
