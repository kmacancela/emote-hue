import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ENTRIES_KEY,
  readStoredEntries,
  saveStoredEntry,
} from '@/src/lib/entriesStore';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import type { HueEntry } from '@/src/types/hue';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);

function buildEntry(overrides: Partial<HueEntry> = {}): HueEntry {
  return {
    id: 'entry-1',
    analysis: sampleHueAnalysis,
    createdAt: '2026-01-01T00:00:00.000Z',
    emotionWords: sampleHueAnalysis.emotionWords,
    intensity: sampleHueAnalysis.intensity,
    primaryEmotion: sampleHueAnalysis.primaryEmotion,
    ...overrides,
  };
}

describe('entriesStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('preserves stored entries when saving from stale hook state', async () => {
    const storedEntry = buildEntry({ id: 'stored-entry' });

    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify([storedEntry]));

    const { entries, entry } = await saveStoredEntry({
      analysis: sampleHueAnalysis,
      title: '  New entry  ',
    });
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    const persisted = JSON.parse(raw ?? '[]') as HueEntry[];

    expect(entry.title).toBe('New entry');
    expect(entries.map((item) => item.id)).toEqual([entry.id, storedEntry.id]);
    expect(persisted.map((item) => item.id)).toEqual([
      entry.id,
      storedEntry.id,
    ]);
  });

  it('drops invalid stored entries and keeps valid ones', async () => {
    const validEntry = buildEntry({ id: 'valid-entry' });

    await AsyncStorage.setItem(
      ENTRIES_KEY,
      JSON.stringify([
        validEntry,
        { id: '', analysis: sampleHueAnalysis },
        { createdAt: '2026-01-02T00:00:00.000Z' },
      ]),
    );

    await expect(readStoredEntries()).resolves.toEqual([validEntry]);
  });
});
