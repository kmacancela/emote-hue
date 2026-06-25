import { useCallback, useEffect, useMemo, useState } from 'react';

import type { HueAnalysis, HueEntry } from '@/src/types/hue';
import { readJson, writeJson } from '@/src/lib/storage';

const ENTRIES_KEY = '@emote-hue/hue-entries';

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

type SaveEntryInput = {
  analysis: HueAnalysis;
  title?: string;
  privateNote?: string;
  transcriptSummary?: string;
  transcript?: string;
};

export function useHueEntries() {
  const [entries, setEntries] = useState<HueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const stored = await readJson<HueEntry[]>(ENTRIES_KEY, []);
    setEntries(stored);
    setIsLoading(false);
  }, []);

  const persistEntries = useCallback(async (next: HueEntry[]) => {
    const sorted = [...next].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    await writeJson(ENTRIES_KEY, sorted);
    setEntries(sorted);
    return sorted;
  }, []);

  const saveEntry = useCallback(
    async ({
      analysis,
      title,
      privateNote,
      transcriptSummary,
      transcript,
    }: SaveEntryInput) => {
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

      await persistEntries([entry, ...entries]);
      return entry;
    },
    [entries, persistEntries],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await persistEntries(entries.filter((entry) => entry.id !== id));
    },
    [entries, persistEntries],
  );

  const deleteAllEntries = useCallback(async () => {
    await persistEntries([]);
  }, [persistEntries]);

  const latestEntry = useMemo(() => entries[0], [entries]);

  useEffect(() => {
    let isMounted = true;

    readJson<HueEntry[]>(ENTRIES_KEY, []).then((stored) => {
      if (isMounted) {
        setEntries(stored);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    deleteAllEntries,
    deleteEntry,
    entries,
    isLoading,
    latestEntry,
    refresh,
    saveEntry,
  };
}
