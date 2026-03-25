import { toCanvas } from 'html-to-image';
import type { PlayerRef } from '@remotion/player';

export interface ExportProgress {
  percent: number;
  status: string;
}

/**
 * Export the Remotion player as a WebM video by stepping through each frame,
 * capturing the DOM with html-to-image, and recording via MediaRecorder.
 */
export async function exportVideo(
  playerRef: React.RefObject<PlayerRef | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  durationInFrames: number,
  fps: number,
  onProgress: (p: ExportProgress) => void
): Promise<Blob> {
  const player = playerRef.current;
  const container = containerRef.current;
  if (!player || !container) throw new Error('Player not found');

  // Find the actual Remotion rendering container (the composition area)
  const remotionContainer = container.querySelector('[data-remotion-canvas]') as HTMLElement
    || container.querySelector('div[style*="overflow"]') as HTMLElement
    || container;

  // Create recording canvas
  const rect = remotionContainer.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);

  const recordCanvas = document.createElement('canvas');
  recordCanvas.width = width * 2;
  recordCanvas.height = height * 2;
  const ctx = recordCanvas.getContext('2d')!;

  // Setup MediaRecorder
  const stream = recordCanvas.captureStream(fps);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
    ? 'video/webm;codecs=vp8'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  // Pause player, seek to start
  player.pause();
  player.seekTo(0);
  await waitMs(100);

  // Start recording
  recorder.start();

  // Step through frames (capture at half fps for speed, each frame drawn twice)
  const captureEvery = 2; // capture every 2nd frame for speed
  const totalCaptures = Math.ceil(durationInFrames / captureEvery);

  for (let i = 0; i < durationInFrames; i += captureEvery) {
    player.seekTo(i);
    await waitMs(50); // let the DOM render

    try {
      const capturedCanvas = await toCanvas(remotionContainer, {
        width: width,
        height: height,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
        filter: (node: HTMLElement) => {
          // Skip the player controls overlay
          const tag = node.tagName?.toLowerCase();
          if (tag === 'button' || node.getAttribute?.('data-remotion-controls') !== null) {
            return false;
          }
          return true;
        },
      });

      ctx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);
      ctx.drawImage(capturedCanvas, 0, 0, recordCanvas.width, recordCanvas.height);

      // Hold this frame for the skipped frames (draw duration)
      await waitMs(Math.round((captureEvery / fps) * 1000));
    } catch {
      // If capture fails for a frame, just hold the previous frame
      await waitMs(Math.round((captureEvery / fps) * 1000));
    }

    const progress = Math.round(((i + captureEvery) / durationInFrames) * 100);
    onProgress({ percent: Math.min(progress, 99), status: 'Recording frames...' });
  }

  // Finish recording
  onProgress({ percent: 99, status: 'Encoding...' });

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };
    recorder.onerror = () => reject(new Error('Export failed. Try reducing video quality in Settings and retry.'));
    recorder.stop();
  });
}

/**
 * Capture one PNG per scene from the Remotion player.
 */
export async function exportPNGFrames(
  playerRef: React.RefObject<PlayerRef | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  durationInFrames: number,
  sceneCount: number,
  onProgress: (p: ExportProgress) => void
): Promise<Blob[]> {
  const player = playerRef.current;
  const container = containerRef.current;
  if (!player || !container) throw new Error('Player not found');

  const remotionContainer = container.querySelector('[data-remotion-canvas]') as HTMLElement
    || container.querySelector('div[style*="overflow"]') as HTMLElement
    || container;

  const rect = remotionContainer.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);

  player.pause();
  const framesPerScene = Math.floor(durationInFrames / sceneCount);
  const frames: Blob[] = [];

  for (let i = 0; i < sceneCount; i++) {
    // Seek to 30% into each scene (past the entrance animation)
    const targetFrame = Math.floor(framesPerScene * i + framesPerScene * 0.3);
    player.seekTo(targetFrame);
    await waitMs(200); // longer wait for clean render

    onProgress({
      percent: Math.round(((i + 1) / sceneCount) * 80),
      status: `Capturing scene ${i + 1}/${sceneCount}...`,
    });

    try {
      const canvas = await toCanvas(remotionContainer, {
        width,
        height,
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), 'image/png')
      );
      frames.push(blob);
    } catch {
      // Fallback: create a labeled placeholder
      const c = document.createElement('canvas');
      c.width = width * 2;
      c.height = height * 2;
      const cx = c.getContext('2d')!;
      cx.fillStyle = '#0A0A0A';
      cx.fillRect(0, 0, c.width, c.height);
      cx.fillStyle = '#F5F5F5';
      cx.font = '48px Inter, sans-serif';
      cx.textAlign = 'center';
      cx.fillText(`Scene ${i + 1}`, c.width / 2, c.height / 2);
      const blob = await new Promise<Blob>((res) =>
        c.toBlob((b) => res(b!), 'image/png')
      );
      frames.push(blob);
    }
  }

  return frames;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadPNGZip(blobs: Blob[], baseName: string) {
  // Download each frame separately
  blobs.forEach((blob, i) => {
    setTimeout(() => {
      downloadBlob(blob, `${baseName}-scene-${i + 1}.png`);
    }, i * 300);
  });
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
