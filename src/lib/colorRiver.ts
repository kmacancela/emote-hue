import { curatedPalettes } from '@/src/lib/palettes';
import type { HueEntry } from '@/src/types/hue';

export type RiverState = {
  flowDays: number;
  unlockedPaletteIds: string[];
};

const BASE_PALETTE_COUNT = 4;
const RIVER_WINDOW_DAYS = 30;

function localDayKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function unlockedCountForFlowDays(flowDays: number) {
  if (flowDays >= 21) {
    return curatedPalettes.length;
  }

  if (flowDays >= 14) {
    return Math.min(curatedPalettes.length, BASE_PALETTE_COUNT + 8);
  }

  if (flowDays >= 7) {
    return Math.min(curatedPalettes.length, BASE_PALETTE_COUNT + 4);
  }

  if (flowDays >= 3) {
    return Math.min(curatedPalettes.length, BASE_PALETTE_COUNT + 2);
  }

  return Math.min(curatedPalettes.length, BASE_PALETTE_COUNT);
}

export function getPaletteUnlockDay(paletteIndex: number) {
  if (paletteIndex < BASE_PALETTE_COUNT) {
    return 0;
  }

  if (paletteIndex < BASE_PALETTE_COUNT + 2) {
    return 3;
  }

  if (paletteIndex < BASE_PALETTE_COUNT + 4) {
    return 7;
  }

  if (paletteIndex < BASE_PALETTE_COUNT + 8) {
    return 14;
  }

  return 21;
}

export function computeRiverState(
  entries: HueEntry[],
  now = new Date(),
): RiverState {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(today.getDate() - (RIVER_WINDOW_DAYS - 1));

  const end = new Date(today);
  end.setDate(today.getDate() + 1);

  const distinctDays = new Set<string>();

  entries.forEach((entry) => {
    const createdAt = new Date(entry.createdAt);
    const entryTime = createdAt.getTime();

    if (!Number.isFinite(entryTime) || createdAt < start || createdAt >= end) {
      return;
    }

    distinctDays.add(localDayKey(createdAt));
  });

  const flowDays = distinctDays.size;
  const unlockedCount = unlockedCountForFlowDays(flowDays);

  return {
    flowDays,
    unlockedPaletteIds: curatedPalettes
      .slice(0, unlockedCount)
      .map((palette) => palette.id),
  };
}
