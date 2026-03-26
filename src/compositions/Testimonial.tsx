import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import {
  getFontFamily, getFontWeight, GradientBg, RadialGlow, Particles, GlowCard, NeonText,
  GradientText, AnimatedDivider, FloatingShapes, SVGDecorationCluster, AnimatedStar,
  AnimatedDonutRing, AnimatedProgressBar, AnimatedCircle,
} from './shared';

interface Props { scenes: SceneData[]; fontStyle: FontStyle; }

export const Testimonial: React.FC<Props> = ({ scenes, fontStyle }) => {
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
              {i === 0 && <QuoteSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
              {i === 1 && <ResultsSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
              {i === 2 && <AttributionSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={i === 0 ? slide({ direction: 'from-bottom' }) : fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

function QuoteSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const quoteScale = spring({ frame, fps, config: { damping: 14, stiffness: 60 } });
  const cardProgress = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 12, stiffness: 70 } });
  const words = scene.headline.split(' ');

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0a15" />
      <RadialGlow color={scene.accentColor} size={600} x="30%" y="40%" opacity={0.12} />
      <RadialGlow color="#06b6d4" size={400} x="70%" y="60%" opacity={0.06} />
      <Particles color={`${scene.accentColor}12`} count={12} seed={33} />
      <SVGDecorationCluster color={scene.accentColor} seed={55} />

      <div style={{
        position: 'absolute', top: '8%', left: '6%', fontSize: 220, fontFamily: 'Georgia, serif',
        color: scene.accentColor, opacity: interpolate(quoteScale, [0, 1], [0, 0.1]), lineHeight: 1,
        transform: `scale(${quoteScale})`,
      }}>{'\u201C'}</div>
      <div style={{
        position: 'absolute', bottom: '8%', right: '6%', fontSize: 220, fontFamily: 'Georgia, serif',
        color: scene.accentColor, opacity: interpolate(quoteScale, [0, 1], [0, 0.07]), lineHeight: 1,
      }}>{'\u201D'}</div>

      <div style={{ position: 'absolute', left: '11%', top: '25%', width: 3, borderRadius: 2,
        height: interpolate(frame, [5, 20], [0, 200], { extrapolateRight: 'clamp' }),
        background: `linear-gradient(180deg, ${scene.accentColor}40, transparent)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        <div style={{ opacity: cardProgress, transform: `translateY(${interpolate(cardProgress, [0, 1], [20, 0])}px)` }}>
          <GlowCard glowColor={scene.accentColor} padding={36} style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: scene.body && !scene.body.includes('|') ? 16 : 0 }}>
              {words.map((word, i) => {
                const delay = 10 + i * 2;
                const wordOpacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateRight: 'clamp' });
                return (
                  <span key={i} style={{
                    fontFamily: font, fontWeight: weight, fontSize: 32, color: '#F5F5F5', opacity: wordOpacity, lineHeight: 1.5,
                    fontStyle: font.includes('Georgia') ? 'italic' : 'normal',
                  }}>{word}</span>
                );
              })}
            </div>
            {scene.body && !scene.body.includes('|') && (
              <div style={{
                fontFamily: font, fontWeight: 400, fontSize: 20, color: '#A3A3A3', textAlign: 'center',
                opacity: interpolate(frame, [duration * 0.5, duration * 0.65], [0, 1], { extrapolateRight: 'clamp' }),
              }}>{scene.body}</div>
            )}
          </GlowCard>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ResultsSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const items = parseItems(scene.body);
  const colors = ['#8b5cf6', '#84cc16', '#06b6d4', '#f59e0b'];

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0f0a" />
      <RadialGlow color={scene.accentColor} size={700} opacity={0.15} />
      <Particles color={`${scene.accentColor}15`} count={15} seed={88} />
      <AnimatedCircle color={scene.accentColor} radius={35} x="88%" y="20%" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }), marginBottom: 36 }}>
          <GradientText from="#F5F5F5" to={scene.accentColor} fontSize={38} fontFamily={font} fontWeight={weight} style={{ textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 700, width: '100%' }}>
          {items.slice(0, 4).map((item, i) => {
            const delay = 8 + i * 5;
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 80 } });
            const color = colors[i % colors.length];
            return (
              <div key={i} style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [25, 0])}px)` }}>
                <div style={{
                  padding: 18, borderRadius: 16, border: `1.5px solid ${color}80`,
                  background: `linear-gradient(135deg, ${color}15, ${color}06, rgba(10,10,15,0.95))`,
                  boxShadow: `0 0 20px ${color}40, 0 0 50px ${color}15`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {item.icon && (
                      <div style={{
                        fontSize: 22, width: 42, height: 42, borderRadius: 12,
                        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                        border: `1px solid ${color}50`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: `0 0 15px ${color}25`,
                      }}>{item.icon}</div>
                    )}
                    <span style={{ fontFamily: font, fontWeight: 600, fontSize: 16, color: '#F5F5F5' }}>{item.text}</span>
                  </div>
                  <AnimatedProgressBar value={70 + i * 8} color={color} height={3} delay={delay + 6} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function AttributionSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const slideUp = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0a15" />
      <RadialGlow color={scene.accentColor} size={400} opacity={0.2} />
      <FloatingShapes color={scene.accentColor} />
      <AnimatedStar color={scene.accentColor} size={20} x="50%" y="18%" />

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: `translateY(${interpolate(slideUp, [0, 1], [40, 0])}px)`, opacity: slideUp,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${scene.accentColor}40, ${scene.accentColor}15)`,
          border: `2px solid ${scene.accentColor}50`, boxShadow: `0 0 30px ${scene.accentColor}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <span style={{ fontSize: 32, color: scene.accentColor }}>{scene.headline.charAt(0).toUpperCase()}</span>
        </div>

        <AnimatedDivider color={scene.accentColor} width={60} />

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <NeonText color="#F5F5F5" fontSize={34} fontFamily={font} fontWeight={weight} glowIntensity={0.4}>
            {scene.headline}
          </NeonText>
        </div>
        {scene.body && (
          <p style={{
            fontFamily: font, fontWeight: 400, fontSize: 20, color: '#A3A3A3', textAlign: 'center', marginTop: 8,
            opacity: interpolate(frame, [12, 22], [0, 1], { extrapolateRight: 'clamp' }),
          }}>{scene.body}</p>
        )}
      </div>
    </AbsoluteFill>
  );
}
