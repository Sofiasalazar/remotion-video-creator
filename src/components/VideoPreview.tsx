import React, { useMemo, forwardRef, useRef, useImperativeHandle } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Play } from 'lucide-react';
import type { TemplateName, SceneData, FontStyle, DurationOption } from '../types';
import { ProductLaunch } from '../compositions/ProductLaunch';
import { SocialMediaPromo } from '../compositions/SocialMediaPromo';
import { TextAnimation } from '../compositions/TextAnimation';
import { Testimonial } from '../compositions/Testimonial';
import { CompanyIntro } from '../compositions/CompanyIntro';

interface Props {
  template: TemplateName | null;
  scenes: SceneData[];
  fontStyle: FontStyle;
  duration: DurationOption;
  showPreview: boolean;
}

export interface VideoPreviewHandle {
  playerRef: React.RefObject<PlayerRef | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const FPS = 30;

function getComposition(template: TemplateName) {
  switch (template) {
    case 'product-launch':
      return ProductLaunch;
    case 'social-media-promo':
      return SocialMediaPromo;
    case 'text-animation':
      return TextAnimation;
    case 'testimonial':
      return Testimonial;
    case 'company-intro':
      return CompanyIntro;
  }
}

export const VideoPreview = forwardRef<VideoPreviewHandle, Props>(
  ({ template, scenes, fontStyle, duration, showPreview }, ref) => {
    const durationInFrames = duration * FPS;
    const Component = template ? getComposition(template) : null;
    const playerRef = useRef<PlayerRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      playerRef,
      containerRef,
    }));

    const inputProps = useMemo(
      () => ({ scenes, fontStyle }),
      [scenes, fontStyle]
    );

    if (!showPreview || !Component || !template) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div
            className="w-full max-w-[720px] rounded-xl border border-[#262626] overflow-hidden"
            style={{
              aspectRatio: '16/9',
              background:
                'radial-gradient(ellipse at center, rgba(139,92,246,0.05) 0%, #000000 70%)',
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-[#262626] flex items-center justify-center">
                <Play size={28} className="text-[#262626] ml-1" />
              </div>
              <p className="text-[16px] font-medium text-[#A3A3A3] text-center px-8">
                Describe your video, pick a template, and hit Preview
              </p>
              <p className="text-[13px] text-[#A3A3A3]/60 text-center">
                Your video will appear here
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 gap-3">
        <div
          ref={containerRef}
          className="w-full max-w-[720px] rounded-xl border border-[#262626] overflow-hidden"
        >
          <Player
            ref={playerRef}
            component={Component}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            compositionWidth={1280}
            compositionHeight={720}
            fps={FPS}
            style={{
              width: '100%',
              aspectRatio: '16/9',
            }}
            controls
            autoPlay={false}
            loop
          />
        </div>

        <div className="flex items-center gap-3 w-full max-w-[720px]">
          <span className="text-[13px] font-medium text-[#A3A3A3]">
            0:00 / 0:{duration < 10 ? `0${duration}` : duration}
          </span>
          <span className="text-[11px] text-[#A3A3A3] bg-[#262626] px-2 py-0.5 rounded-full">
            16:9
          </span>
        </div>
      </div>
    );
  }
);

VideoPreview.displayName = 'VideoPreview';

export { FPS };
