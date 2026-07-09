import { useCallback, useEffect, useState } from 'react';

import type { ColorCalibration } from '@/src/types/hue';
import { readJson, writeJson } from '@/src/lib/storage';

const CALIBRATION_KEY = '@emote-hue/color-calibration';

export const calibrationCards = [
  {
    hex: '#6C4AB6',
    name: 'Purple drift',
    words: [
      'Dreamy',
      'Private',
      'Electric',
      'Restless',
      'Creative',
      'Deep',
      'Mysterious',
      'Focused',
      'Expansive',
      'Sensitive',
      'Charged',
      'Curious',
    ],
  },
  {
    hex: '#F6A85D',
    name: 'Amber switch',
    words: [
      'Warm',
      'Bold',
      'Playful',
      'Buzzing',
      'Bright',
      'Impatient',
      'Radiant',
      'Brave',
      'Energetic',
      'Fiery',
      'Open',
      'Quick',
    ],
  },
  {
    hex: '#F4A6C1',
    name: 'Rose hush',
    words: [
      'Tender',
      'Soft',
      'Open',
      'Blushy',
      'Sweet',
      'Delicate',
      'Caring',
      'Gentle',
      'Hopeful',
      'Vulnerable',
      'Warm',
      'Kind',
    ],
  },
  {
    hex: '#92C7A3',
    name: 'Sage exhale',
    words: [
      'Calm',
      'Grounded',
      'Spacious',
      'Safe',
      'Steady',
      'Easy',
      'Balanced',
      'Clear',
      'Rested',
      'Patient',
      'Held',
      'Quiet',
    ],
  },
  {
    hex: '#3F315B',
    name: 'Night pocket',
    words: [
      'Heavy',
      'Quiet',
      'Hidden',
      'Tired',
      'Deep',
      'Private',
      'Guarded',
      'Still',
      'Worn',
      'Low',
      'Slow',
      'Closed',
    ],
  },
  {
    hex: '#D8D6E8',
    name: 'Moon pause',
    words: [
      'Blank',
      'Floating',
      'Sleepy',
      'Distant',
      'Clean',
      'Still',
      'Clear',
      'Pale',
      'Cool',
      'Weightless',
      'Hushed',
      'Light',
    ],
  },
] as const;

export const calibrationSwatches = calibrationCards.map((card) => card.hex);

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useColorCalibration() {
  const [calibrations, setCalibrations] = useState<ColorCalibration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const stored = await readJson<ColorCalibration[]>(CALIBRATION_KEY, []);
    setCalibrations(stored);
    setIsLoading(false);
  }, []);

  const saveCalibrations = useCallback(
    async (selectedLabels: Record<string, string[]>) => {
      const next = Object.entries(selectedLabels)
        .filter(([, labels]) => labels.length > 0)
        .map(([hex, labels]) => ({
          id: createId(),
          hex,
          labels,
          createdAt: new Date().toISOString(),
        }));

      await writeJson(CALIBRATION_KEY, next);
      setCalibrations(next);
      return next;
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    readJson<ColorCalibration[]>(CALIBRATION_KEY, []).then((stored) => {
      if (isMounted) {
        setCalibrations(stored);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { calibrations, isLoading, refresh, saveCalibrations };
}
