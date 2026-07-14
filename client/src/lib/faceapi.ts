import * as faceapi from 'face-api.js';
import { elementSize, type CameraElement } from './camera';

/**
 * face-api.js helpers. Models are served from /public/models (see README for
 * the download script). TinyFaceDetector + landmarks + recognition ≈ 6 MB.
 */

let loaded: Promise<void> | null = null;

export function loadModels(): Promise<void> {
  loaded ??= Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  ]).then(() => undefined);
  return loaded;
}

export const detectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
  scoreThreshold: 0.5,
});

export interface DetectedFace {
  descriptor: Float32Array;
  box: { x: number; y: number; width: number; height: number };
  score: number;
}

export async function detectFaces(input: CameraElement): Promise<DetectedFace[]> {
  const detections = await faceapi
    .detectAllFaces(input, detectorOptions)
    .withFaceLandmarks()
    .withFaceDescriptors();
  return detections.map((d) => ({
    descriptor: d.descriptor,
    box: d.detection.box,
    score: d.detection.score,
  }));
}

export async function detectSingleFace(input: CameraElement): Promise<DetectedFace | null> {
  const detection = await faceapi
    .detectSingleFace(input, detectorOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) return null;
  return {
    descriptor: detection.descriptor,
    box: detection.detection.box,
    score: detection.detection.score,
  };
}

export function euclideanDistance(a: Float32Array | number[], b: Float32Array | number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/** One recognizable person — enrolled member or day-pass guest. */
export interface RecognitionTarget {
  kind: 'member' | 'guest';
  id: number;
  name: string;
  descriptors: number[][];
}

export interface Match {
  kind: 'member' | 'guest';
  id: number;
  name: string;
  distance: number;
}

/** Best match for a descriptor across every target's captures. */
export function matchDescriptor(
  descriptor: Float32Array,
  targets: RecognitionTarget[],
  threshold: number,
): Match | null {
  let best: Match | null = null;
  for (const target of targets) {
    for (const d of target.descriptors) {
      const distance = euclideanDistance(descriptor, d);
      if (distance <= threshold && (!best || distance < best.distance)) {
        best = { kind: target.kind, id: target.id, name: target.name, distance };
      }
    }
  }
  return best;
}

/** Downscaled JPEG snapshot of the current camera frame (member photo). */
export function snapshot(input: CameraElement, maxWidth = 320): string {
  const { width, height } = elementSize(input);
  const scale = Math.min(1, maxWidth / width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d')?.drawImage(input, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}
