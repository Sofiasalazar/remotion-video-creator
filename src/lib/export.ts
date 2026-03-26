import { toCanvas } from 'html-to-image';
import type { PlayerRef } from '@remotion/player';

export interface ExportProgress {
  percent: number;
  status: string;
}

const FRAME_CAPTURE_TIMEOUT = 3000; // 3s max per frame
const GLOBAL_EXPORT_TIMEOUT = 180_000; // 3 minutes max total

/**
 * Wrap a promise with a timeout. Rejects if the promise doesn't resolve in time.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${label} took longer than ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/**
 * Export the Remotion player as a video by stepping through each frame,
 * capturing the DOM with html-to-image, and recording via MediaRecorder.
 * After recording, converts WebM to MP4 using @remotion/webcodecs if available.
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

  // Global timeout abort
  const abortController = new AbortController();
  const globalTimer = setTimeout(() => abortController.abort(), GLOBAL_EXPORT_TIMEOUT);

  try {
    // Find the actual Remotion rendering container
    const remotionContainer = container.querySelector('[data-remotion-canvas]') as HTMLElement
      || container.querySelector('div[style*="overflow"]') as HTMLElement
      || container;

    const rect = remotionContainer.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    // Create recording canvas (1x pixel ratio for speed and memory)
    const recordCanvas = document.createElement('canvas');
    recordCanvas.width = width;
    recordCanvas.height = height;
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
      videoBitsPerSecond: 5_000_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    // Pause player, seek to start
    player.pause();
    player.seekTo(0);
    await waitMs(150);

    // Start recording
    recorder.start();

    // Step through frames
    const captureEvery = 2;
    let failedFrames = 0;

    for (let i = 0; i < durationInFrames; i += captureEvery) {
      if (abortController.signal.aborted) throw new Error('Export timed out');

      player.seekTo(i);
      await waitMs(60);

      try {
        const capturedCanvas = await withTimeout(
          toCanvas(remotionContainer, {
            width,
            height,
            pixelRatio: 1,
            cacheBust: true,
            skipFonts: false,
            filter: (node: HTMLElement) => {
              const tag = node.tagName?.toLowerCase();
              if (tag === 'button' || node.getAttribute?.('data-remotion-controls') !== null) {
                return false;
              }
              return true;
            },
          }),
          FRAME_CAPTURE_TIMEOUT,
          `Frame ${i}`,
        );

        ctx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);
        ctx.drawImage(capturedCanvas, 0, 0, recordCanvas.width, recordCanvas.height);
      } catch {
        failedFrames++;
        // Hold previous frame on failure -- don't block
      }

      // Hold this frame for the duration of skipped frames
      await waitMs(Math.round((captureEvery / fps) * 1000));

      const progress = Math.round(((i + captureEvery) / durationInFrames) * 85);
      onProgress({ percent: Math.min(progress, 85), status: `Recording frames... (${Math.round((i / durationInFrames) * 100)}%)` });
    }

    if (failedFrames > durationInFrames * 0.5) {
      throw new Error(`Too many frames failed to capture (${failedFrames}). Try refreshing and retrying.`);
    }

    // Finish recording
    onProgress({ percent: 88, status: 'Encoding video...' });

    const webmBlob = await new Promise<Blob>((resolve, reject) => {
      const stopTimer = setTimeout(() => reject(new Error('MediaRecorder stop timed out')), 10_000);
      recorder.onstop = () => {
        clearTimeout(stopTimer);
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };
      recorder.onerror = () => {
        clearTimeout(stopTimer);
        reject(new Error('Export encoding failed'));
      };
      recorder.stop();
    });

    // Try to convert WebM to MP4 using @remotion/webcodecs
    onProgress({ percent: 90, status: 'Converting to MP4...' });
    try {
      const mp4Blob = await convertWebmToMp4(webmBlob, onProgress);
      return mp4Blob;
    } catch {
      // Fallback: return WebM if MP4 conversion fails
      onProgress({ percent: 99, status: 'Downloaded as WebM (MP4 conversion unavailable)' });
      return webmBlob;
    }
  } finally {
    clearTimeout(globalTimer);
  }
}

/**
 * Convert a WebM blob to MP4 using @remotion/webcodecs.
 * Falls back to returning the original blob if the browser doesn't support WebCodecs.
 */
async function convertWebmToMp4(
  webmBlob: Blob,
  onProgress: (p: ExportProgress) => void,
): Promise<Blob> {
  const { convertMedia } = await import('@remotion/webcodecs');

  const file = new File([webmBlob], 'recording.webm', { type: 'video/webm' });

  const result = await convertMedia({
    src: file,
    container: 'mp4',
    videoCodec: 'h264',
    audioCodec: 'aac',
  });

  onProgress({ percent: 98, status: 'Saving MP4...' });
  const mp4Blob = await result.save();
  return mp4Blob;
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
    const targetFrame = Math.floor(framesPerScene * i + framesPerScene * 0.3);
    player.seekTo(targetFrame);
    await waitMs(200);

    onProgress({
      percent: Math.round(((i + 1) / sceneCount) * 80),
      status: `Capturing scene ${i + 1}/${sceneCount}...`,
    });

    try {
      const canvas = await withTimeout(
        toCanvas(remotionContainer, {
          width,
          height,
          pixelRatio: 2,
          cacheBust: true,
        }),
        FRAME_CAPTURE_TIMEOUT,
        `Scene ${i + 1}`,
      );

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
  blobs.forEach((blob, i) => {
    setTimeout(() => {
      downloadBlob(blob, `${baseName}-scene-${i + 1}.png`);
    }, i * 300);
  });
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
