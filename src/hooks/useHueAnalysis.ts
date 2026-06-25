import { useCallback, useState } from 'react';

import { createMockHueAnalysis } from '@/src/lib/mockHue';
import type { ColorCalibration } from '@/src/types/hue';

export function useHueAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeReflection = useCallback(
    async (
      reflection: string,
      intensity: number,
      calibration: ColorCalibration[] = [],
    ) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 420));
        return createMockHueAnalysis(reflection, intensity, calibration);
      } catch {
        setError(
          'We could not translate this feeling right now. You can try again or save a blank Hue Entry.',
        );
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  return { analyzeReflection, error, isAnalyzing };
}
