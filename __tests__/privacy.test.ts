import { buildShareCardPayload } from '@/src/lib/privacy';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import type { HueEntry } from '@/src/types/hue';

const entry: HueEntry = {
  id: 'entry-1',
  analysis: sampleHueAnalysis,
  createdAt: '2026-06-24T12:00:00.000Z',
  emotionWords: sampleHueAnalysis.emotionWords,
  intensity: sampleHueAnalysis.intensity,
  primaryEmotion: sampleHueAnalysis.primaryEmotion,
  privateNote: 'private note',
  transcript: 'raw words',
};

describe('share card payload', () => {
  it('excludes private text by default', () => {
    const payload = buildShareCardPayload(entry);

    expect(payload.privateNote).toBeUndefined();
    expect(payload.transcript).toBeUndefined();
  });

  it('includes private text only when explicitly requested', () => {
    const payload = buildShareCardPayload(entry, true);

    expect(payload.privateNote).toBe('private note');
    expect(payload.transcript).toBe('raw words');
  });
});
