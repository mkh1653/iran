export const MAP_BOUNDS = {
  W: 43.5,
  E: 64.0,
  S: 24.5,
  Nn: 40.2,
};

export interface MapPointData {
  positions: Float32Array;
  heights: Float32Array;
  seeds: Float32Array;
  count: number;
}

export interface BustPointData {
  targets: Float32Array;
  brightness: Float32Array;
}

/**
 * image loading with progress (Real Progress)
 */
export async function loadImageWithProgress(
  src: string,
  onProgress?: (percent: number) => void,
): Promise<HTMLImageElement> {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`error on loading image: ${src}`);

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  if (!response.body || total === 0) {
    // if server doesn't support content-length
    const blob = await response.blob();
    onProgress?.(100);
    return createHTMLImageFromBlob(blob);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;
    if (onProgress) {
      onProgress(Math.round((loaded / total) * 100));
    }
  }

  const blob = new Blob(
    chunks.map((chunk) => {
      const copy = new Uint8Array(chunk.byteLength);
      copy.set(chunk);
      return copy.buffer;
    }),
  );
  return createHTMLImageFromBlob(blob);
}

function createHTMLImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * reading pixel data from Canvas 2D
 */
export function getImagePixelData(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return {
    data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    w: canvas.width,
    h: canvas.height,
  };
}

/**
 * creating map points from DEM image
 */
export function generateMapPoints(
  demImg: HTMLImageElement,
  isMobile: boolean
): MapPointData {
  const dem = getImagePixelData(demImg);
  const STEP = isMobile ? 3 : 2;

  const positions: number[] = [];
  const heights: number[] = [];
  const seeds: number[] = [];

  const spanLon = MAP_BOUNDS.E - MAP_BOUNDS.W;
  const spanLat = MAP_BOUNDS.Nn - MAP_BOUNDS.S;
  const WORLD = 110;
  const scale = WORLD / spanLon;
  const HEIGHT_SCALE = 14;

  for (let y = 0; y < dem.h; y += STEP) {
    for (let x = 0; x < dem.w; x += STEP) {
      const i = (y * dem.w + x) * 4;
      const mask = dem.data[i + 2] as number;
      if (mask < 120) continue; // remove points with low mask value (blue channel)

      // extracting exact elevation in meters from the combination of R and G channels
      const raw =
        ((dem.data[i] as number) * 256 + (dem.data[i + 1] as number)) / 65535;
      const meters = raw * 6500 - 500;
      const h = Math.max(0, meters) / 5600; // 0..1

      const lon = MAP_BOUNDS.W + (x / (dem.w - 1)) * spanLon;
      const lat = MAP_BOUNDS.Nn - (y / (dem.h - 1)) * spanLat;
      const latCorr = Math.cos(
        (((MAP_BOUNDS.Nn + MAP_BOUNDS.S) / 2) * Math.PI) / 180
      );

      positions.push(
        (lon - (MAP_BOUNDS.W + MAP_BOUNDS.E) / 2) * scale * latCorr,
        h * HEIGHT_SCALE + 0.05,
        -(lat - (MAP_BOUNDS.S + MAP_BOUNDS.Nn) / 2) * scale
      );
      heights.push(h);
      seeds.push(Math.random());
    }
  }

  return {
    positions: new Float32Array(positions),
    heights: new Float32Array(heights),
    seeds: new Float32Array(seeds),
    count: heights.length,
  };
}

/**
 * creating bust points from bust image
 */
export function generateBustPoints(
  bustImg: HTMLImageElement,
  targetPointCount: number
): BustPointData {
  const bust = getImagePixelData(bustImg);
  const cand: { x: number; y: number; b: number }[] = [];
  const bStep = 2;

  for (let y = 0; y < bust.h; y += bStep) {
    for (let x = 0; x < bust.w; x += bStep) {
      const i = (y * bust.w + x) * 4;
      // extracting exact brightness value from the pixel for 3D face relief
      const b =
        (0.299 * (bust.data[i] as number) +
          0.587 * (bust.data[i + 1] as number) +
          0.114 * (bust.data[i + 2] as number)) /
        255;
      if (b < 0.12) continue;
      cand.push({ x, y, b });
    }
  }

  const BUST_H = 58;
  const bScale = BUST_H / bust.h;
  const targets = new Float32Array(targetPointCount * 3);
  const bright = new Float32Array(targetPointCount);

  for (let k = 0; k < targetPointCount; k++) {
    const c = cand[(Math.random() * cand.length) | 0]!;
    const jx = (Math.random() - 0.5) * bStep;
    const jy = (Math.random() - 0.5) * bStep;

    targets[k * 3] = (c.x + jx - bust.w / 2) * bScale;
    targets[k * 3 + 1] =
      (bust.h - (c.y + jy)) * bScale - BUST_H * 0.5 + 6;
    // formula for creating 3D face relief from brightness values
    targets[k * 3 + 2] = (c.b - 0.5) * 12 + (Math.random() - 0.5) * 1.2;
    bright[k] = c.b;
  }

  return {
    targets,
    brightness: bright,
  };
}