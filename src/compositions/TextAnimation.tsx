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
import {
  getFontFamily,
  getFontWeight,
  GradientBg,
  RadialGlow,
  Particles,
  GradientText,
  NeonText,
  AnimatedDivider,
  GridPattern,
  GlowCard,
} from './shared';

interface Props {
  scenes: SceneData[];
  fontStyle: FontStyle;
}

export const TextAnimation: React.FC<Props> = ({ scenes, fontStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const sceneDuration = Math.floor(durationInFrames / scenes.length);
  const font = getFontFamily(fontStyle);
  const weight = getFontWeight(fontStyle);

  return (
    <AbsoluteFill>
      {scenes.map((scene, i) => (
        <Sequence key={i} from={sceneDuration * i} durationInFrames={sceneDuration}>
          {i === 0 && <ProblemSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 1 && <SolutionSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
          {i === 2 && <PunchlineSlide scene={scene} fps={fps} duration={sceneDuration} font={font} weight={weight} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ── Slide 1: Problem statement with typewriter + sub-points ── */
function ProblemSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const text = scene.headline;
  const charsToShow = Math.min(text.length,
    Math.floor(interpolate(frame, [5, duration * 0.45], [0, text.length], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }))
  );
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const cursorBlink = frame % 16 < 10;
  const typing = charsToShow < text.length;

  // Sub-points from body (pipe-separated or period-separated)
  const subPoints = scene.body.includes('|')
    ? scene.body.split('|').map(s => s.trim())
    : scene.body.split('.').filter(Boolean).map(s => s.trim());

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0a0a1a" />
      <GridPattern color={scene.accentColor} opacity={0.03} size={80} />
      <RadialGlow color={scene.accentColor} size={600} opacity={0.15} />
      <Particles color={`${scene.accentColor}15`} count={12} seed={11} />

      {/* Vertical accent line */}
      <div style={{
        position: 'absolute', left: '10%', top: '25%',
        width: 3, height: interpolate(frame, [0, 15], [0, 250], { extrapolateRight: 'clamp' }),
        background: `linear-gradient(180deg, ${scene.accentColor}50, transparent)`, borderRadius: 2,
      }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        {/* Headline with typewriter */}
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

        {/* Sub-points as pills/tags */}
        {!typing && subPoints.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {subPoints.map((point, i) => {
              const delay = duration * 0.5 + i * 5;
              const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 80 } });
              return (
                <div key={i} style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [15, 0])}px)` }}>
                  <GlowCard glowColor={scene.accentColor} padding={10} style={{ paddingLeft: 20, paddingRight: 20 }}>
                    <span style={{ fontFamily: font, fontWeight: 500, fontSize: 18, color: '#A3A3A3' }}>
                      {point}
                    </span>
                  </GlowCard>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* ── Slide 2: Solution with word-by-word reveal + sub-cards ── */
function SolutionSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const words = scene.headline.split(' ');
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp' });

  const subPoints = scene.body.includes('|')
    ? scene.body.split('|').map(s => s.trim())
    : scene.body.split('.').filter(Boolean).map(s => s.trim());

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0a1a0a" angle={180} />
      <RadialGlow color={scene.accentColor} size={700} opacity={0.2} />
      <Particles color={`${scene.accentColor}20`} count={18} seed={22} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>
        {/* Word-by-word headline */}
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
              }}>
                {word}
              </span>
            );
          })}
        </div>

        {/* Sub-points as inline badges */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          {subPoints.map((point, i) => {
            const delay = words.length * 5 + 5 + i * 6;
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 70 } });
            return (
              <div key={i} style={{
                opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
                padding: '10px 20px', borderRadius: 10,
                border: `1px solid ${scene.accentColor}30`,
                background: `${scene.accentColor}08`,
              }}>
                <span style={{ fontFamily: font, fontWeight: 500, fontSize: 18, color: scene.accentColor }}>
                  {point}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Slide 3: Punchline with scale-up ─────────────────────── */
function PunchlineSlide({ scene, fps, duration, font, weight }: {
  scene: SceneData; fps: number; duration: number; font: string; weight: number;
}) {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps, config: { damping: 6, stiffness: 40, mass: 1.2 } });
  const fadeOut = interpolate(frame, [duration - 18, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const ringScale = interpolate(frame, [0, 40], [0.5, 2], { extrapolateRight: 'clamp' });
  const ringOpacity = interpolate(frame, [0, 40], [0.3, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBg color1="#0A0A0A" color2="#0f0520" />
      <RadialGlow color={scene.accentColor} size={800} opacity={0.3 + Math.sin(frame * 0.1) * 0.1} />

      {/* Expanding ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 250, height: 250,
        borderRadius: '50%', border: `2px solid ${scene.accentColor}`,
        transform: `translate(-50%, -50%) scale(${ringScale})`, opacity: ringOpacity,
      }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${interpolate(scale, [0, 1], [0.3, 1])})`, textAlign: 'center', padding: '0 60px' }}>
          <GradientText from={scene.accentColor} to="#F5F5F5" fontSize={68} fontFamily={font} fontWeight={weight}>
            {scene.headline}
          </GradientText>
        </div>

        {scene.body && (
          <div style={{
            marginTop: 20,
            opacity: interpolate(frame, [15, 28], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            <span style={{ fontFamily: font, fontWeight: 500, fontSize: 24, color: scene.accentColor }}>
              {scene.body}
            </span>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <AnimatedDivider color={scene.accentColor} width={100} />
        </div>
      </div>
    </AbsoluteFill>
  );
}
