import type { HueEntry } from '@/src/types/hue';

function localDayKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function getLastDays(count: number, now = new Date()) {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const day = new Date(end);

    day.setDate(end.getDate() - (count - 1 - index));

    return day;
  });
}

export function groupEntriesByDay(
  entries: HueEntry[],
  days: Date[],
): (HueEntry | null)[] {
  const latestEntryByDay = new Map<string, HueEntry>();

  entries.forEach((entry) => {
    const createdAt = new Date(entry.createdAt);
    const entryTime = createdAt.getTime();

    if (!Number.isFinite(entryTime)) {
      return;
    }

    const key = localDayKey(createdAt);
    const existing = latestEntryByDay.get(key);
    const existingTime = existing ? new Date(existing.createdAt).getTime() : 0;

    if (!existing || entryTime >= existingTime) {
      latestEntryByDay.set(key, entry);
    }
  });

  return days.map((day) => latestEntryByDay.get(localDayKey(day)) ?? null);
}

export function formatEntryDate(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function formatShortDate(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoDate));
}
