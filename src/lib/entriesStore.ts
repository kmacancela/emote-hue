import type { HueAnalysis, HueEntry } from '@/src/types/hue';
import { hueEntrySchema } from './schemas';
import { readJson, writeJson } from './storage';

export const ENTRIES_KEY = '@emote-hue/hue-entries';

export type SaveEntryInput = {
  analysis: HueAnalysis;
  title?: string;
  privateNote?: string;
  transcriptSummary?: string;
  transcript?: string;
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function sortEntries(entries: HueEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function persistStoredEntries(entries: HueEntry[]) {
  const sorted = sortEntries(entries);

  await writeJson(ENTRIES_KEY, sorted);
  return sorted;
}

export async function readStoredEntries(): Promise<HueEntry[]> {
  const stored = await readJson<unknown>(ENTRIES_KEY, []);

  if (!Array.isArray(stored)) {
    return [];
  }

  return sortEntries(
    stored.reduce<HueEntry[]>((validEntries, entry) => {
      const parsed = hueEntrySchema.safeParse(entry);

      if (parsed.success) {
        validEntries.push(parsed.data);
      }

      return validEntries;
    }, []),
  );
}

export async function saveStoredEntry({
  analysis,
  title,
  privateNote,
  transcriptSummary,
  transcript,
}: SaveEntryInput): Promise<{ entries: HueEntry[]; entry: HueEntry }> {
  const stored = await readStoredEntries();
  const entry: HueEntry = {
    id: createId(),
    createdAt: new Date().toISOString(),
    title: title?.trim() || undefined,
    privateNote: privateNote?.trim() || undefined,
    transcriptSummary,
    transcript,
    intensity: analysis.intensity,
    primaryEmotion: analysis.primaryEmotion,
    emotionWords: analysis.emotionWords,
    analysis,
  };
  const entries = await persistStoredEntries([entry, ...stored]);

  return { entries, entry };
}

export async function deleteStoredEntry(id: string) {
  const stored = await readStoredEntries();

  return persistStoredEntries(stored.filter((entry) => entry.id !== id));
}

export async function deleteAllStoredEntries() {
  return persistStoredEntries([]);
}
