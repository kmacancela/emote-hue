import type { HueEntry } from '@/src/types/hue';

export function buildShareCardPayload(
  entry: HueEntry,
  includePrivateText = false,
) {
  return {
    id: entry.id,
    createdAt: entry.createdAt,
    palette: entry.analysis.palette,
    visual: entry.analysis.visual,
    intensity: entry.intensity,
    primaryEmotion: entry.primaryEmotion,
    privateNote: includePrivateText ? entry.privateNote : undefined,
    transcript: includePrivateText ? entry.transcript : undefined,
  };
}
