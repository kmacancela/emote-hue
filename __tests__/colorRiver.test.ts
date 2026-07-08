import { computeRiverState } from '@/src/lib/colorRiver';
import { curatedPalettes } from '@/src/lib/palettes';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import type { HueEntry } from '@/src/types/hue';

function buildEntry(id: string, date: Date): HueEntry {
  return {
    id,
    analysis: sampleHueAnalysis,
    createdAt: date.toISOString(),
    emotionWords: sampleHueAnalysis.emotionWords,
    intensity: sampleHueAnalysis.intensity,
    primaryEmotion: sampleHueAnalysis.primaryEmotion,
  };
}

function buildEntriesForDays(dayCount: number, now: Date) {
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - index);

    return buildEntry(`entry-${index}`, date);
  });
}

describe('computeRiverState', () => {
  const now = new Date(2026, 6, 8, 12);

  it('unlocks the base palettes when there are no entries', () => {
    expect(computeRiverState([], now)).toEqual({
      flowDays: 0,
      unlockedPaletteIds: curatedPalettes
        .slice(0, 4)
        .map((palette) => palette.id),
    });
  });

  it('unlocks threshold palettes at river boundaries', () => {
    expect(
      computeRiverState(buildEntriesForDays(2, now), now).unlockedPaletteIds,
    ).toHaveLength(4);
    expect(
      computeRiverState(buildEntriesForDays(3, now), now).unlockedPaletteIds,
    ).toHaveLength(6);
    expect(
      computeRiverState(buildEntriesForDays(7, now), now).unlockedPaletteIds,
    ).toHaveLength(8);
    expect(
      computeRiverState(buildEntriesForDays(14, now), now).unlockedPaletteIds,
    ).toHaveLength(12);
    expect(
      computeRiverState(buildEntriesForDays(21, now), now).unlockedPaletteIds,
    ).toHaveLength(12);
  });

  it('counts multiple same-day entries once', () => {
    const morning = new Date(2026, 6, 8, 8);
    const evening = new Date(2026, 6, 8, 20);
    const yesterday = new Date(2026, 6, 7, 12);

    expect(
      computeRiverState(
        [
          buildEntry('morning', morning),
          buildEntry('evening', evening),
          buildEntry('yesterday', yesterday),
        ],
        now,
      ).flowDays,
    ).toBe(2);
  });

  it('ignores entries outside the last 30 days', () => {
    const oldEntryDate = new Date(now);
    oldEntryDate.setDate(now.getDate() - 30);

    expect(
      computeRiverState(
        [buildEntry('today', now), buildEntry('old', oldEntryDate)],
        now,
      ).flowDays,
    ).toBe(1);
  });
});
