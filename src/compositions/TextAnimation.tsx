import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import type { SceneData, FontStyle } from '../types';
import {
  getFontFamily,
  getFontWeight,
  GradientBg,
  RadialGlow,
  Particles,
  GradientText,
  AnimatedDivider,
  GridPattern,
  GlowCard,
  AnimatedCircle,
  AnimatedTriangle,
  AnimatedProgressBar,
  MorphingShape,
  ExpandingRing,
  SVGDecorationCluster,
} from './shared';

interface Props {
  scenes: SceneData[];
  fontStyle: FontStyle;
}

export const TextAnimation: React.FC<Props> = ({ scenes, fontStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const font = getFontFamily(fontStyle);
  const weight = getFontWeight(fontStyle);

  const TRANSITION_FRAMES = Math.round(fps * 0.6);
  const transitionOverlap = (scenes.length - 1) * TRANSITION_FRAMES;
  const sceneDuration = Math.floor((durationInFrames + transitionOverlap) / scenes.length);

  return (
    <AbsoluteFill>
      <TransitionSeries>
        {scenes.map((scene, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={sceneDuration}>
              {i === 0 && <ProblemSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
              {i === 1 && <SolutionSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
              {i === 2 && <PunchlineSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

function ProblemSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const text = scene.headline;
  const charsToShow = Math.min(text.length,
    Math.floor(interpolate(frame, [5, duration * 0.45], [0, text.length], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }))
  );
  const cursorBlink = frame % 16 < 10;
  const typing = charsToShow < text.length;

  const subPoints = scene.body.includes('|')
    ? scene.body.split('|').map(s => s.trim())
    : scene.body.split('.').filter(Boolean).map(s => s.trim());

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a0a1a" />
      <GridPattern color={scene.accentColor} opacity={0.03} size={80} />
      <RadialGlow color={scene.accentColor} size={600} opacity={0.15} />
      <Particles color={`${scene.accentColor}15`} count={12} seed={11} />
      <AnimatedTriangle color={scene.accentColor} size={50} x="85%" y="25%" direction="down" />
      <AnimatedCircle color={scene.accentColor} radius={40} x="12%" y="70%" />

      <div style={{ position: 'absolute', left: '10%', top: '25%', width: 3,
        height: interpolate(frame, [0, 15], [0, 250], { extrapolateRight: 'clamp' }),
        background: `linear-gradient(180deg, ${scene.accentColor}50, transparent)`, borderRadius: 2 }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        <div style={{
          fontFamily: font, fontWeight: weight, fontSize: 52, color: '#F5F5F5',
          textAlign: 'center', lineHeight: 1.3, marginBottom: 32,
          textShadow: `0 0 20px ${scene.accentColor}20`,
        }}>
          {text.slice(0, charsToShow)}
          {(typing || cursorBlink) && (
            <span style={{ color: scene.accentColor, fontWeight: 300, opacity: cursorBlink ? 1 : 0.3 }}>|</span>
          )}
        </div>

        {!typing && subPoints.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {subPoints.map((point, i) => {
              const delay = duration * 0.5 + i * 5;
              const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 80 } });
              return (
                <div key={i} style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [15, 0])}px)` }}>
                  <GlowCard glowColor={scene.accentColor} padding={10} style={{ paddingLeft: 20, paddingRight: 20 }}>
                    <span style={{ fontFamily: font, fontWeight: 500, fontSize: 18, color: '#A3A3A3' }}>{point}</span>
                  </GlowCard>
                </div>
              );
            })}
          </div>
        )}

        {!typing && (
          <AnimatedProgressBar value={75} color="#ef4444" height={4} width={300} delay={Math.round(duration * 0.6)} />
        )}
      </div>
    </AbsoluteFill>
  );
}

function SolutionSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const words = scene.headline.split(' ');

  const subPoints = scene.body.includes('|')
    ? scene.body.split('|').map(s => s.trim())
    : scene.body.split('.').filter(Boolean).map(s => s.trim());

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0a1a0a" angle={180} />
      <RadialGlow color={scene.accentColor} size={700} opacity={0.2} />
      <Particles color={`${scene.accentColor}20`} count={18} seed={22} />
      <SVGDecorationCluster color={scene.accentColor} seed={33} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 36 }}>
          {words.map((word, i) => {
            const s = spring({ frame: Math.max(0, frame - i * 5), fps, config: { damping: 10, stiffness: 80 } });
            const isLast = i === words.length - 1;
            return (
              <span key={i} style={{
                fontFamily: font, fontWeight: weight, fontSize: 52, display: 'inline-block',
                opacity: s, transform: `translateY(${interpolate(s, [0, 1], [25, 0])}px)`,
                color: isLast ? scene.accentColor : '#F5F5F5',
                textShadow: isLast ? `0 0 20px ${scene.accentColor}40` : 'none',
              }}>{word}</span>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          {subPoints.map((point, i) => {
            const delay = words.length * 5 + 5 + i * 6;
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 70 } });
            return (
              <div key={i} style={{
                opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
                padding: '10px 20px', borderRadius: 10,
                border: `1px solid ${scene.accentColor}30`, background: `${scene.accentColor}08`,
              }}>
                <span style={{ fontFamily: font, fontWeight: 500, fontSize: 18, color: scene.accentColor }}>{point}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, width: 300 }}>
          <AnimatedProgressBar value={100} color={scene.accentColor} height={4} delay={Math.round(words.length * 5 + subPoints.length * 6 + 10)} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function PunchlineSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps, config: { damping: 6, stiffness: 40, mass: 1.2 } });

  return (
    <AbsoluteFill>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <RadialGlow color={scene.accentColor} size={800} opacity={0.3 + Math.sin(frame * 0.1) * 0.1} />
      <ExpandingRing color={scene.accentColor} size={250} duration={40} />
      <MorphingShape color={scene.accentColor} size={120} fromShape="star" toShape="circle" x="50%" y="50%" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${interpolate(scale, [0, 1], [0.3, 1])})`, textAlign: 'center', padding: '0 60px' }}>
          <GradientText from={scene.accentColor} to="#F5F5F5" fontSize={68} fontFamily={font} fontWeight={weight}>
            {scene.headline}
          </GradientText>
        </div>

        {scene.body && (
          <div style={{ marginTop: 20, opacity: interpolate(frame, [15, 28], [0, 1], { extrapolateRight: 'clamp' }) }}>
            <span style={{ fontFamily: font, fontWeight: 500, fontSize: 24, color: scene.accentColor }}>{scene.body}</span>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <AnimatedDivider color={scene.accentColor} width={100} />
        </div>
      </div>
    </AbsoluteFill>
  );
}
