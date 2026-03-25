export type TemplateName =
  | 'product-launch'
  | 'social-media-promo'
  | 'text-animation'
  | 'testimonial'
  | 'company-intro';

export type DurationOption = 15 | 30;
export type ExportFormat = 'mp4' | 'png';
export type ExportQuality = '720p' | '1080p';
export type FontStyle = 'clean' | 'bold' | 'elegant';

export interface SceneData {
  label: string;
  headline: string;
  body: string;
  bgColor: string;
  accentColor: string;
}

export interface TemplateDefinition {
  id: TemplateName;
  name: string;
  icon: string;
  description: string;
  scenes: SceneData[];
}

export interface VideoProject {
  concept: string;
  duration: DurationOption;
  template: TemplateName | null;
  scenes: SceneData[];
  globalPrimaryColor: string;
  globalAccentColor: string;
  fontStyle: FontStyle;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}
