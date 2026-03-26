import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Rocket,
  Megaphone,
  Type,
  Quote,
  Building2,
  Loader2,
  Film,
  Image,
  Download,
  Sparkles,
} from 'lucide-react';
import type {
  VideoProject,
  TemplateName,
  DurationOption,
  SceneData,
  FontStyle,
  ExportFormat,
} from '../types';
import { TEMPLATES, getDefaultScenes } from '../lib/templates';
import { enhanceWithAI } from '../lib/anthropic';
import type { ExportProgress } from '../lib/export';

interface Props {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject>>;
  apiKey: string;
  onAIUsage: (input: number, output: number) => void;
  onPreview: () => void;
  showPreview: boolean;
  onExport: (format: ExportFormat) => void;
  exportProgress: ExportProgress | null;
  exportDone: boolean;
}

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  rocket: Rocket,
  megaphone: Megaphone,
  type: Type,
  quote: Quote,
  building: Building2,
};

export const WizardPanel: React.FC<Props> = ({
  project,
  setProject,
  apiKey,
  onAIUsage,
  onPreview,
  showPreview,
  onExport,
  exportProgress,
  exportDone,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [exportFormat, setExportFormat] = useState<ExportFormat>('mp4');

  const completedSteps = new Set<number>();
  if (project.concept.trim()) completedSteps.add(1);
  if (project.template) completedSteps.add(2);
  if (project.scenes.length > 0 && project.scenes.some((s) => s.headline.trim())) completedSteps.add(3);

  const goNext = (from: number) => {
    if (from === 1 && !project.concept.trim()) {
      setValidationErrors({ concept: 'Describe your video concept before continuing.' });
      return;
    }
    if (from === 2 && !project.template) {
      setValidationErrors({ template: 'Select a template to continue.' });
      return;
    }
    setValidationErrors({});
    setActiveStep(from + 1);
  };

  const handleTemplateSelect = (id: TemplateName) => {
    const scenes = getDefaultScenes(id);
    setProject((p) => ({ ...p, template: id, scenes }));
    setValidationErrors({});
  };

  const handleAIEnhance = async () => {
    if (!apiKey || !project.template) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await enhanceWithAI(apiKey, project.concept, project.template);
      setProject((p) => ({ ...p, scenes: result.scenes }));
      onAIUsage(result.inputTokens, result.outputTokens);
      // Auto-advance to step 3
      setActiveStep(3);
    } catch (e: any) {
      setAiError(e.message || 'An error occurred.');
    } finally {
      setAiLoading(false);
    }
  };

  const updateScene = (index: number, field: keyof SceneData, value: string) => {
    setProject((p) => {
      const scenes = [...p.scenes];
      scenes[index] = { ...scenes[index], [field]: value };
      return { ...p, scenes };
    });
  };

  const steps = [
    { num: 1, title: 'Concept' },
    { num: 2, title: 'Template Style' },
    { num: 3, title: 'Customize' },
    { num: 4, title: 'Export' },
  ];

  return (
    <div className="w-full lg:w-[380px] xl:w-[380px] md:w-[320px] flex-shrink-0 bg-[#0A0A0A] lg:border-r border-[#262626] overflow-y-auto lg:h-full">
      <div className="p-4 space-y-1">
        {steps.map((step, i) => (
          <div key={step.num}>
            {/* Step Header */}
            <button
              onClick={() => setActiveStep(step.num)}
              className="w-full flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-[#141414] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            >
              {/* Step number circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 ${
                  completedSteps.has(step.num) && activeStep !== step.num
                    ? 'bg-[#84cc16] text-white'
                    : activeStep === step.num
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-[#262626] text-[#A3A3A3]'
                }`}
              >
                {completedSteps.has(step.num) && activeStep !== step.num ? (
                  <Check size={14} />
                ) : (
                  step.num
                )}
              </div>

              <span
                className={`text-[14px] font-semibold flex-1 text-left ${
                  activeStep === step.num || completedSteps.has(step.num)
                    ? 'text-[#F5F5F5]'
                    : 'text-[#A3A3A3]'
                }`}
              >
                {step.title}
              </span>

              {activeStep === step.num ? (
                <ChevronUp size={16} className="text-[#A3A3A3]" />
              ) : (
                <ChevronDown size={16} className="text-[#A3A3A3]" />
              )}
            </button>

            {/* Step Content */}
            {activeStep === step.num && (
              <div className="pb-4 px-2">
                {step.num === 1 && (
                  <Step1Concept
                    concept={project.concept}
                    duration={project.duration}
                    onConceptChange={(v) => setProject((p) => ({ ...p, concept: v }))}
                    onDurationChange={(v) => setProject((p) => ({ ...p, duration: v }))}
                    onNext={() => goNext(1)}
                    validationError={validationErrors.concept}
                  />
                )}
                {step.num === 2 && (
                  <Step2Template
                    selected={project.template}
                    onSelect={handleTemplateSelect}
                    onNext={() => goNext(2)}
                    validationError={validationErrors.template}
                  />
                )}
                {step.num === 3 && (
                  <Step3Customize
                    scenes={project.scenes}
                    onUpdateScene={updateScene}
                    globalPrimary={project.globalPrimaryColor}
                    globalAccent={project.globalAccentColor}
                    fontStyle={project.fontStyle}
                    onGlobalPrimaryChange={(v) =>
                      setProject((p) => ({
                        ...p,
                        globalPrimaryColor: v,
                        scenes: p.scenes.map((s) => ({ ...s, accentColor: v })),
                      }))
                    }
                    onGlobalAccentChange={(v) =>
                      setProject((p) => ({ ...p, globalAccentColor: v }))
                    }
                    onFontStyleChange={(v) => setProject((p) => ({ ...p, fontStyle: v }))}
                    onPreview={onPreview}
                    showPreview={showPreview}
                    apiKey={apiKey}
                    aiLoading={aiLoading}
                    aiError={aiError}
                    onAIEnhance={handleAIEnhance}
                    concept={project.concept}
                  />
                )}
                {step.num === 4 && (
                  <Step4Export
                    format={exportFormat}
                    onFormatChange={setExportFormat}
                    onExport={() => onExport(exportFormat)}
                    progress={exportProgress}
                    done={exportDone}
                    hasPreview={showPreview}
                  />
                )}
              </div>
            )}

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="ml-[22px] w-0.5 h-2 bg-[#262626]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Step 1: Concept ----

function Step1Concept({
  concept,
  duration,
  onConceptChange,
  onDurationChange,
  onNext,
  validationError,
}: {
  concept: string;
  duration: DurationOption;
  onConceptChange: (v: string) => void;
  onDurationChange: (v: DurationOption) => void;
  onNext: () => void;
  validationError?: string;
}) {
  return (
    <div className="space-y-4 mt-2">
      <div>
        <label className="block text-[14px] font-semibold text-[#F5F5F5] mb-2">
          Describe your video
        </label>
        <textarea
          value={concept}
          onChange={(e) => onConceptChange(e.target.value)}
          placeholder="e.g., A 20-second product launch video for our new AI analytics dashboard. Highlight speed, accuracy, and ease of use."
          className={`w-full h-[120px] bg-[#0A0A0A] border rounded-lg px-3 py-2.5 text-[14px] text-[#F5F5F5] resize-none focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 placeholder:text-[#A3A3A3]/50 ${
            validationError ? 'border-[#ef4444]' : 'border-[#262626] focus:border-[#8b5cf6]'
          }`}
        />
        {validationError && (
          <p className="text-[13px] text-[#ef4444] mt-1">{validationError}</p>
        )}
      </div>

      {/* Duration selector */}
      <div>
        <label className="block text-[12px] font-medium text-[#A3A3A3] mb-2">
          Duration
        </label>
        <div className="flex gap-2">
          {([15, 30] as DurationOption[]).map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
                duration === d
                  ? 'bg-[#8b5cf6] text-white'
                  : 'bg-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5]'
              }`}
            >
              {d} seconds
            </button>
          ))}
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className={`w-full h-10 rounded-lg text-[14px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
          concept.trim()
            ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
            : 'bg-[#262626] text-[#A3A3A3] cursor-not-allowed'
        }`}
      >
        Next
      </button>
    </div>
  );
}

// ---- Step 2: Template ----

function Step2Template({
  selected,
  onSelect,
  onNext,
  validationError,
}: {
  selected: TemplateName | null;
  onSelect: (id: TemplateName) => void;
  onNext: () => void;
  validationError?: string;
}) {
  return (
    <div className="space-y-4 mt-2">
      <label className="block text-[14px] font-semibold text-[#F5F5F5]">
        Choose a template
      </label>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((tpl, i) => {
          const IconComponent = ICON_MAP[tpl.icon] || Rocket;
          const isLast = i === TEMPLATES.length - 1;
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              className={`bg-[#141414] rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
                isLast ? 'col-span-2' : ''
              } ${
                selected === tpl.id
                  ? 'border-2 border-[#8b5cf6] shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                  : 'border-2 border-[#262626] hover:border-[rgba(139,92,246,0.5)]'
              }`}
              style={{ minHeight: 120 }}
            >
              <IconComponent size={32} className="text-[#8b5cf6]" />
              <span className="text-[13px] font-semibold text-[#F5F5F5]">
                {tpl.name}
              </span>
              <span className="text-[11px] text-[#A3A3A3] text-center">
                {tpl.description}
              </span>
            </button>
          );
        })}
      </div>

      {validationError && (
        <p className="text-[13px] text-[#ef4444]">{validationError}</p>
      )}

      <button
        onClick={onNext}
        className={`w-full h-10 rounded-lg text-[14px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
          selected
            ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
            : 'bg-[#262626] text-[#A3A3A3] cursor-not-allowed'
        }`}
      >
        Next
      </button>
    </div>
  );
}

// ---- Step 3: Customize ----

function Step3Customize({
  scenes,
  onUpdateScene,
  globalPrimary,
  globalAccent,
  fontStyle,
  onGlobalPrimaryChange,
  onGlobalAccentChange,
  onFontStyleChange,
  onPreview,
  showPreview,
  apiKey,
  aiLoading,
  aiError,
  onAIEnhance,
  concept,
}: {
  scenes: SceneData[];
  onUpdateScene: (i: number, field: keyof SceneData, value: string) => void;
  globalPrimary: string;
  globalAccent: string;
  fontStyle: FontStyle;
  onGlobalPrimaryChange: (v: string) => void;
  onGlobalAccentChange: (v: string) => void;
  onFontStyleChange: (v: FontStyle) => void;
  onPreview: () => void;
  showPreview: boolean;
  apiKey: string;
  aiLoading: boolean;
  aiError: string | null;
  onAIEnhance: () => void;
  concept: string;
}) {
  const [expandedScene, setExpandedScene] = useState(0);

  return (
    <div className="space-y-4 mt-2">
      <label className="block text-[14px] font-semibold text-[#F5F5F5]">
        Customize your video
      </label>

      {/* Scene cards */}
      <div className="space-y-2">
        {scenes.map((scene, i) => (
          <div
            key={i}
            className="bg-[#141414] border border-[#262626] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedScene(expandedScene === i ? -1 : i)}
              className="w-full flex items-center justify-between px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            >
              <span className="text-[13px] font-semibold text-[#F5F5F5]">
                Scene {i + 1}: {scene.label}
              </span>
              {expandedScene === i ? (
                <ChevronUp size={14} className="text-[#A3A3A3]" />
              ) : (
                <ChevronDown size={14} className="text-[#A3A3A3]" />
              )}
            </button>

            {expandedScene === i && (
              <div className="px-3 pb-3 space-y-3">
                {/* Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-medium text-[#A3A3A3]">
                      Headline
                    </label>
                    <span className="text-[11px] text-[#A3A3A3]">
                      {scene.headline.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={scene.headline}
                    onChange={(e) =>
                      e.target.value.length <= 60 &&
                      onUpdateScene(i, 'headline', e.target.value)
                    }
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-[14px] text-[#F5F5F5] focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
                  />
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-medium text-[#A3A3A3]">
                      Body text
                    </label>
                    <span className="text-[11px] text-[#A3A3A3]">
                      {scene.body.length}/500
                    </span>
                  </div>
                  <textarea
                    value={scene.body}
                    onChange={(e) =>
                      e.target.value.length <= 500 &&
                      onUpdateScene(i, 'body', e.target.value)
                    }
                    className="w-full h-[80px] bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-[14px] text-[#F5F5F5] resize-none focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
                  />
                </div>

                {/* Colors */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-[#A3A3A3] mb-1 block">
                      Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={scene.bgColor}
                        onChange={(e) => onUpdateScene(i, 'bgColor', e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={scene.bgColor}
                        onChange={(e) => onUpdateScene(i, 'bgColor', e.target.value)}
                        className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded px-2 py-1 text-[12px] text-[#F5F5F5] focus:outline-none focus:border-[#8b5cf6]"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[12px] font-medium text-[#A3A3A3] mb-1 block">
                      Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={scene.accentColor}
                        onChange={(e) => onUpdateScene(i, 'accentColor', e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={scene.accentColor}
                        onChange={(e) => onUpdateScene(i, 'accentColor', e.target.value)}
                        className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded px-2 py-1 text-[12px] text-[#F5F5F5] focus:outline-none focus:border-[#8b5cf6]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global overrides */}
      {scenes.length > 0 && (
        <div className="border-t border-[#262626] pt-4 space-y-3">
          <label className="text-[12px] font-medium text-[#A3A3A3] uppercase tracking-wider">
            Global Overrides
          </label>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[12px] font-medium text-[#A3A3A3] mb-1 block">
                Primary color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={globalPrimary}
                  onChange={(e) => onGlobalPrimaryChange(e.target.value)}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[12px] text-[#A3A3A3]">{globalPrimary}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-medium text-[#A3A3A3] mb-1 block">
                Accent color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={globalAccent}
                  onChange={(e) => onGlobalAccentChange(e.target.value)}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[12px] text-[#A3A3A3]">{globalAccent}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#A3A3A3] mb-2 block">
              Font style
            </label>
            <select
              value={fontStyle}
              onChange={(e) => onFontStyleChange(e.target.value as FontStyle)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-[14px] text-[#F5F5F5] focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
            >
              <option value="clean">Clean (Inter)</option>
              <option value="bold">Bold (Inter Black)</option>
              <option value="elegant">Elegant (Serif)</option>
            </select>
          </div>
        </div>
      )}

      {/* AI Enhance - available here after template is selected */}
      {apiKey && (
        <button
          onClick={onAIEnhance}
          disabled={aiLoading || !concept.trim() || scenes.length === 0}
          className={`w-full h-10 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
            aiLoading || !concept.trim() || scenes.length === 0
              ? 'bg-[#262626] text-[#A3A3A3] cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500'
          }`}
        >
          {aiLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating script...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Enhance with AI
            </>
          )}
        </button>
      )}

      {aiError && (
        <div className="bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-lg px-4 py-3 text-[13px] text-[#ef4444]">
          {aiError}
        </div>
      )}

      {/* Preview button */}
      <button
        onClick={onPreview}
        disabled={scenes.length === 0}
        className={`w-full h-10 rounded-lg text-[14px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
          scenes.length > 0
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500'
            : 'bg-[#262626] text-[#A3A3A3] cursor-not-allowed'
        }`}
      >
        {showPreview ? 'Update Preview' : 'Preview'}
      </button>
    </div>
  );
}

// ---- Step 4: Export ----

function Step4Export({
  format,
  onFormatChange,
  onExport,
  progress,
  done,
  hasPreview,
}: {
  format: ExportFormat;
  onFormatChange: (f: ExportFormat) => void;
  onExport: () => void;
  progress: ExportProgress | null;
  done: boolean;
  hasPreview: boolean;
}) {
  return (
    <div className="space-y-4 mt-2">
      <label className="block text-[14px] font-semibold text-[#F5F5F5]">
        Export your video
      </label>

      {/* Format cards */}
      <div className="space-y-2">
        <button
          onClick={() => onFormatChange('mp4')}
          className={`w-full bg-[#141414] rounded-lg p-4 flex items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
            format === 'mp4'
              ? 'border-2 border-[#8b5cf6]'
              : 'border-2 border-[#262626] hover:border-[rgba(139,92,246,0.5)]'
          }`}
        >
          <Film size={24} className="text-[#8b5cf6] flex-shrink-0" />
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#F5F5F5]">
              MP4 Video
            </div>
            <div className="text-[12px] text-[#A3A3A3]">
              Full video file, ready for social media
            </div>
          </div>
        </button>

        <button
          onClick={() => onFormatChange('png')}
          className={`w-full bg-[#141414] rounded-lg p-4 flex items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
            format === 'png'
              ? 'border-2 border-[#8b5cf6]'
              : 'border-2 border-[#262626] hover:border-[rgba(139,92,246,0.5)]'
          }`}
        >
          <Image size={24} className="text-[#8b5cf6] flex-shrink-0" />
          <div className="text-left">
            <div className="text-[14px] font-semibold text-[#F5F5F5]">
              PNG Frames
            </div>
            <div className="text-[12px] text-[#A3A3A3]">
              Individual frames as images (ZIP download)
            </div>
          </div>
        </button>
      </div>

      {/* Export button */}
      <button
        onClick={onExport}
        disabled={!hasPreview || !!progress}
        className={`w-full h-12 rounded-lg text-[16px] font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
          done
            ? 'bg-[#84cc16] text-white'
            : !hasPreview || progress
            ? 'bg-[#262626] text-[#A3A3A3] cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500'
        }`}
      >
        {/* Progress bar overlay */}
        {progress && !done && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-violet-600 to-[#84cc16] opacity-30"
            style={{ width: `${progress.percent}%`, transition: 'width 0.3s' }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {done ? (
            <>
              <Check size={18} />
              Downloaded
            </>
          ) : progress ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {progress.percent}%
            </>
          ) : (
            <>
              <Download size={18} />
              {format === 'mp4' ? 'Download MP4' : 'Download Frames'}
            </>
          )}
        </span>
      </button>

      <p className="text-[12px] text-[#A3A3A3]">
        Export uses your browser&apos;s MediaRecorder API. Processing time
        depends on video length and device performance.
      </p>
    </div>
  );
}
