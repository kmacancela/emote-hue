import { useCallback, useEffect, useMemo, useState } from 'react';

import type { HueEntry } from '@/src/types/hue';
import {
  deleteAllStoredEntries,
  deleteStoredEntry,
  readStoredEntries,
  saveStoredEntry,
  type SaveEntryInput,
} from '@/src/lib/entriesStore';

export function useHueEntries() {
  const [entries, setEntries] = useState<HueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const stored = await readStoredEntries();
    setEntries(stored);
    setIsLoading(false);
  }, []);

  const saveEntry = useCallback(async (input: SaveEntryInput) => {
    const { entries: nextEntries, entry } = await saveStoredEntry(input);
    setEntries(nextEntries);
    return entry;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const nextEntries = await deleteStoredEntry(id);
    setEntries(nextEntries);
  }, []);

  const deleteAllEntries = useCallback(async () => {
    const nextEntries = await deleteAllStoredEntries();
    setEntries(nextEntries);
  }, []);

  const latestEntry = useMemo(() => entries[0], [entries]);

  useEffect(() => {
    let isMounted = true;

    readStoredEntries().then((stored) => {
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
