import { useCallback, useEffect } from 'react';

import {
  initializeTypeScaleFromStorage,
  persistTypeScale,
  TYPE_SCALE_FACTORS,
  useTypeScaleStore,
} from '@/src/lib/typeScaleStore';
import type { TypeScale } from '@/src/lib/settings';

export function useTypeScale() {
  const typeScale = useTypeScaleStore();

  useEffect(() => {
    void initializeTypeScaleFromStorage();
  }, []);

  const setTypeScale = useCallback(async (value: TypeScale) => {
    await persistTypeScale(value);
  }, []);

  return {
    scaleFactor: TYPE_SCALE_FACTORS[typeScale],
    setTypeScale,
    typeScale,
  };
}
