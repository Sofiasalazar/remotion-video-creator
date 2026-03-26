import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { noise3D } from '@remotion/noise';
import type { SceneData, FontStyle } from '../types';
import { parseItems } from '../lib/templates';
import { SPRING, usePulse } from '../lib/animation';
import {
  getFontFamily, getFontWeight, GradientBg, RadialGlow, Particles, GlowCard, NeonText,
  GradientText, AnimatedDivider, FloatingShapes, SVGDecorationCluster, AnimatedStar,
  AnimatedDonutRing, AnimatedNumber, AnimatedCircle,
  DataVizRow, ColorShiftGlow,
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
              {i === 1 && <ResultsVizSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
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
  const quoteScale = spring({ frame, fps, config: SPRING.SMOOTH });
  const cardProgress = spring({ frame: Math.max(0, frame - 8), fps, config: SPRING.BOUNCY });
  const words = scene.headline.split(' ');

  // Color-shifting quote marks
  const quoteColor = interpolateColors(frame, [0, 30, 60], [`${scene.accentColor}15`, `${scene.accentColor}25`, `${scene.accentColor}10`]);

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0a15" />
      <RadialGlow color={scene.accentColor} size={600} x="30%" y="40%" opacity={0.12} />
      <RadialGlow color="#06b6d4" size={400} x="70%" y="60%" opacity={0.06} />
      <Particles color={`${scene.accentColor}12`} count={12} seed={33} />
      <SVGDecorationCluster color={scene.accentColor} seed={55} />

      <div style={{
        position: 'absolute', top: '8%', left: '6%', fontSize: 220, fontFamily: 'Georgia, serif',
        color: scene.accentColor, opacity: quoteScale * 0.15, lineHeight: 1,
        transform: `scale(${quoteScale})`,
      }}>{'\u201C'}</div>
      <div style={{
        position: 'absolute', bottom: '8%', right: '6%', fontSize: 220, fontFamily: 'Georgia, serif',
        color: scene.accentColor, opacity: quoteScale * 0.08, lineHeight: 1,
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
                // Noise-based subtle y-offset per word for organic feel
                const wordNoise = noise3D('word-float', i, 0, frame * 0.02) * 3;
                return (
                  <span key={i} style={{
                    fontFamily: font, fontWeight: weight, fontSize: 32, color: '#F5F5F5', opacity: wordOpacity, lineHeight: 1.5,
                    fontStyle: font.includes('Georgia') ? 'italic' : 'normal',
                    transform: `translateY(${wordNoise}px)`,
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

// Replaces ResultsSlide card grid -- data dashboard with donut + horizontal bars
function ResultsVizSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const items = parseItems(scene.body);
  const headlineOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Extract first numeric value for the donut
  const firstNumMatch = items[0]?.text.match(/(\d+)/);
  const donutValue = firstNumMatch ? Math.min(parseInt(firstNumMatch[1]), 100) : 80;

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0f0a" />
      <ColorShiftGlow
        colors={[scene.accentColor, '#84cc16', '#06b6d4']}
        size={600}
        opacity={0.1}
        x="35%"
        y="50%"
      />
      <Particles color={`${scene.accentColor}15`} count={15} seed={88} />
      <AnimatedCircle color={scene.accentColor} radius={35} x="88%" y="20%" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: 40 }}>
        {/* Headline */}
        <div style={{ opacity: headlineOpacity, textAlign: 'center', marginBottom: 24 }}>
          <GradientText from="#F5F5F5" to={scene.accentColor} fontSize={36} fontFamily={font} fontWeight={weight} style={{ textAlign: 'center' }}>
            {scene.headline}
          </GradientText>
        </div>

        {/* Data dashboard layout: donut left, bars right */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60,
        }}>
          {/* Donut with primary metric */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <AnimatedDonutRing
              percentage={donutValue}
              color={scene.accentColor}
              size={160}
              strokeWidth={10}
              label={`${donutValue}%`}
            />
            {items[0] && (
              <div style={{
                fontSize: 14, fontFamily: font, fontWeight: 500,
                color: '#A3A3A3', textAlign: 'center', maxWidth: 140,
              }}>
                {items[0].text}
              </div>
            )}
          </div>

          {/* Horizontal bar rows for remaining items */}
          <div style={{ flex: 1, maxWidth: 500 }}>
            <DataVizRow
              items={items.slice(1)}
              accentColor={scene.accentColor}
              font={font}
              weight={weight}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function AttributionSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const slideUp = spring({ frame, fps, config: SPRING.SMOOTH });

  // Noise-based gentle avatar float
  const avatarFloat = noise3D('avatar-float', 0, 0, frame * 0.02) * 5;

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
          transform: `translateY(${avatarFloat}px)`,
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
