import type { HueEntry } from '@/src/types/hue';

export function buildShareCardPayload(entry: HueEntry) {
  return {
    id: entry.id,
    createdAt: entry.createdAt,
    emotionWords: entry.emotionWords,
    palette: entry.analysis.palette,
    visual: entry.analysis.visual,
    intensity: entry.intensity,
    primaryEmotion: entry.primaryEmotion,
  };
}

export type ShareCardPayload = ReturnType<typeof buildShareCardPayload>;
