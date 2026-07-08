import { groupEntriesByDay } from '@/src/utils/date';
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

describe('groupEntriesByDay', () => {
  it('buckets entries oldest to newest and keeps the latest entry per day', () => {
    const days = [
      new Date(2026, 0, 1, 12),
      new Date(2026, 0, 2, 12),
      new Date(2026, 0, 3, 12),
    ];
    const firstDayEntry = buildEntry('first-day', new Date(2026, 0, 1, 9));
    const secondDayOlder = buildEntry(
      'second-day-older',
      new Date(2026, 0, 2, 8),
    );
    const secondDayLatest = buildEntry(
      'second-day-latest',
      new Date(2026, 0, 2, 20),
    );

    expect(
      groupEntriesByDay([secondDayOlder, firstDayEntry, secondDayLatest], days),
    ).toEqual([firstDayEntry, secondDayLatest, null]);
  });

  it('returns quiet gaps when there are no entries', () => {
    const days = [new Date(2026, 0, 1, 12), new Date(2026, 0, 2, 12)];

    expect(groupEntriesByDay([], days)).toEqual([null, null]);
  });
});
