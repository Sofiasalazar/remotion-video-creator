import { toCanvas } from 'html-to-image';
import type { PlayerRef } from '@remotion/player';

export interface ExportProgress {
  percent: number;
  status: string;
}

const FRAME_CAPTURE_TIMEOUT = 4000; // 4s max per frame
const GLOBAL_EXPORT_TIMEOUT = 300_000; // 5 minutes max

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/**
 * Export the Remotion player as video.
 *
 * Strategy: capture every Nth frame at reduced resolution, then
 * use MediaRecorder timing to produce smooth playback. After
 * recording finishes, convert WebM → MP4 via @remotion/webcodecs.
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

  const globalTimer = setTimeout(() => {
    throw new Error('Export timed out after 5 minutes');
  }, GLOBAL_EXPORT_TIMEOUT);

  try {
    const remotionContainer = container.querySelector('[data-remotion-canvas]') as HTMLElement
      || container.querySelector('div[style*="overflow"]') as HTMLElement
      || container;

    const rect = remotionContainer.getBoundingClientRect();
    // Use half resolution for fast capture
    const captureW = Math.round(rect.width * 0.75);
    const captureH = Math.round(rect.height * 0.75);

    // Recording canvas at capture size
    const recordCanvas = document.createElement('canvas');
    recordCanvas.width = captureW;
    recordCanvas.height = captureH;
    const ctx = recordCanvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // MediaRecorder at the target fps -- it will duplicate frames automatically
    const stream = recordCanvas.captureStream(fps);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4_000_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    player.pause();
    player.seekTo(0);
    await waitMs(200);

    recorder.start(100); // request data every 100ms

    // Capture every 6th frame = ~5 effective captures per second
    // For 15s video (450 frames) = 75 captures. At ~200ms each ≈ 15-20 seconds total.
    const captureEvery = 6;
    const totalCaptures = Math.ceil(durationInFrames / captureEvery);
    let failedFrames = 0;

    const filterFn = (node: HTMLElement) => {
      const tag = node.tagName?.toLowerCase();
      if (tag === 'button' || node.getAttribute?.('data-remotion-controls') !== null) {
        return false;
      }
      return true;
    };

    for (let i = 0; i < durationInFrames; i += captureEvery) {
      player.seekTo(i);
      await waitMs(40); // brief wait for DOM render

      try {
        const captured = await withTimeout(
          toCanvas(remotionContainer, {
            width: captureW,
            height: captureH,
            pixelRatio: 1,
            cacheBust: true,
            skipFonts: true, // skip font embedding for speed
            filter: filterFn,
          }),
          FRAME_CAPTURE_TIMEOUT,
          `Frame ${i}`,
        );

        ctx.clearRect(0, 0, captureW, captureH);
        ctx.drawImage(captured, 0, 0, captureW, captureH);
      } catch {
        failedFrames++;
      }

      // Hold frame for the right duration so MediaRecorder records at correct speed
      // captureEvery frames at fps = captureEvery/fps seconds per capture
      const holdMs = Math.round((captureEvery / fps) * 1000);
      await waitMs(holdMs);

      const captureIndex = Math.floor(i / captureEvery);
      const pct = Math.round((captureIndex / totalCaptures) * 85);
      onProgress({ percent: Math.min(pct, 85), status: `Recording... ${Math.round((i / durationInFrames) * 100)}%` });
    }

    onProgress({ percent: 87, status: 'Encoding...' });

    // Stop recording
    const webmBlob = await new Promise<Blob>((resolve, reject) => {
      const stopTimer = setTimeout(() => reject(new Error('Encoding timed out')), 15_000);
      recorder.onstop = () => {
        clearTimeout(stopTimer);
        resolve(new Blob(chunks, { type: mimeType }));
      };
      recorder.onerror = () => {
        clearTimeout(stopTimer);
        reject(new Error('Encoding failed'));
      };
      recorder.stop();
    });

    // Convert WebM → MP4
    onProgress({ percent: 90, status: 'Converting to MP4...' });
    try {
      const mp4Blob = await withTimeout(
        convertWebmToMp4(webmBlob),
        30_000,
        'MP4 conversion',
      );
      onProgress({ percent: 99, status: 'Done' });
      return mp4Blob;
    } catch {
      // Fallback: return WebM directly
      onProgress({ percent: 99, status: 'Done (WebM format)' });
      return webmBlob;
    }
  } finally {
    clearTimeout(globalTimer);
  }
}

async function convertWebmToMp4(webmBlob: Blob): Promise<Blob> {
  const { convertMedia } = await import('@remotion/webcodecs');
  const file = new File([webmBlob], 'recording.webm', { type: 'video/webm' });
  const result = await convertMedia({
    src: file,
    container: 'mp4',
    videoCodec: 'h264',
    audioCodec: 'aac',
  });
  return await result.save();
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
    await waitMs(300);

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
