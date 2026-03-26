import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DataNotice } from './components/DataNotice';
import { SettingsModal } from './components/SettingsModal';
import { WizardPanel } from './components/WizardPanel';
import { VideoPreview, FPS } from './components/VideoPreview';
import type { VideoPreviewHandle } from './components/VideoPreview';
import { FooterCTA } from './components/FooterCTA';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTokenCounter } from './hooks/useTokenCounter';
import { exportVideo, exportPNGFrames, downloadBlob, downloadPNGZip } from './lib/export';
import type { VideoProject, ExportFormat, ExportQuality } from './types';
import type { ExportProgress } from './lib/export';

const INITIAL_PROJECT: VideoProject = {
  concept: '',
  duration: 15,
  template: null,
  scenes: [],
  globalPrimaryColor: '#8b5cf6',
  globalAccentColor: '#84cc16',
  fontStyle: 'clean',
};

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('agenticsis_video_creator_api_key', '');
  const [quality, setQuality] = useLocalStorage<ExportQuality>('agenticsis_video_creator_quality', '720p');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [project, setProject] = useState<VideoProject>(INITIAL_PROJECT);
  const [showPreview, setShowPreview] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const previewRef = useRef<VideoPreviewHandle>(null);
  const { usage, totalTokens, addUsage } = useTokenCounter();

  const handlePreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!showPreview || !project.template || !previewRef.current) return;
      setExportDone(false);

      const { playerRef, containerRef } = previewRef.current;
      const durationInFrames = project.duration * FPS;

      try {
        if (format === 'mp4') {
          setExportProgress({ percent: 0, status: 'Starting...' });
          const blob = await exportVideo(
            playerRef,
            containerRef,
            durationInFrames,
            FPS,
            setExportProgress
          );
          downloadBlob(blob, `video-${project.template}-${Date.now()}.mp4`);
        } else {
          setExportProgress({ percent: 0, status: 'Capturing frames...' });
          const frames = await exportPNGFrames(
            playerRef,
            containerRef,
            durationInFrames,
            project.scenes.length,
            setExportProgress
          );
          setExportProgress({ percent: 90, status: 'Downloading...' });
          await downloadPNGZip(frames, `video-${project.template}`);
        }

        setExportDone(true);
        setTimeout(() => setExportDone(false), 3000);
      } catch (e: any) {
        alert(e.message || 'Export failed.');
      } finally {
        setExportProgress(null);
      }
    },
    [showPreview, project]
  );

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] text-[#F5F5F5] font-sans">
      <Header
        hasApiKey={!!apiKey}
        tokenUsage={usage}
        totalTokens={totalTokens}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <DataNotice />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
        onClearApiKey={() => setApiKey('')}
        quality={quality}
        onQualityChange={setQuality}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-14 mb-12" style={{ paddingTop: 40 }}>
        <WizardPanel
          project={project}
          setProject={setProject}
          apiKey={apiKey}
          onAIUsage={addUsage}
          onPreview={handlePreview}
          showPreview={showPreview}
          onExport={handleExport}
          exportProgress={exportProgress}
          exportDone={exportDone}
        />

        <VideoPreview
          ref={previewRef}
          template={project.template}
          scenes={project.scenes}
          fontStyle={project.fontStyle}
          duration={project.duration}
          showPreview={showPreview}
        />
      </div>

      <FooterCTA />
    </div>
  );
}
