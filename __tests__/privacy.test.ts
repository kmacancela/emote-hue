import type { ShareCardEntry } from '@/src/components/ShareCard';
import { buildShareCardPayload } from '@/src/lib/privacy';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import type { HueEntry } from '@/src/types/hue';

type NoPrivateShareCardEntryKeys =
  Extract<
    keyof ShareCardEntry,
    'privateNote' | 'transcript' | 'transcriptSummary'
  > extends never
    ? true
    : false;

const shareCardEntryHasNoPrivateKeys: NoPrivateShareCardEntryKeys = true;

const entry: HueEntry = {
  id: 'entry-1',
  analysis: sampleHueAnalysis,
  createdAt: '2026-06-24T12:00:00.000Z',
  emotionWords: sampleHueAnalysis.emotionWords,
  intensity: sampleHueAnalysis.intensity,
  primaryEmotion: sampleHueAnalysis.primaryEmotion,
  privateNote: 'private note',
  transcript: 'raw words',
  transcriptSummary: 'summary',
};

describe('share card payload', () => {
  it('strips private text fields', () => {
    const payload = buildShareCardPayload(entry);

    expect(payload).not.toHaveProperty('privateNote');
    expect(payload).not.toHaveProperty('transcript');
    expect(payload).not.toHaveProperty('transcriptSummary');
  });

  it('matches the narrow ShareCard entry contract', () => {
    const payload: ShareCardEntry = buildShareCardPayload(entry);

    expect(shareCardEntryHasNoPrivateKeys).toBe(true);
    expect(payload).toEqual({
      createdAt: entry.createdAt,
      emotionWords: entry.emotionWords,
      id: entry.id,
      intensity: entry.intensity,
      palette: entry.analysis.palette,
      primaryEmotion: entry.primaryEmotion,
      visual: entry.analysis.visual,
    });
  });
});
