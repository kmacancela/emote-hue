import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';
import { clamp, withAlpha } from '@/src/utils/color';

const barCount = 24;
const trackHeight = 46;

function normalizeMetering(metering: number | null | undefined) {
  const db = metering ?? -60;
  return clamp((db + 60) / 50, 0.15, 1);
}

type WaveformBarsProps = {
  metering?: number | null;
  reduceMotion?: boolean;
};

export function WaveformBars({ metering, reduceMotion }: WaveformBarsProps) {
  const [history, setHistory] = useState<number[]>(
    Array.from({ length: barCount }, () => 0.35),
  );
  const staticHistory = useMemo(
    () => Array.from({ length: barCount }, () => 0.45),
    [],
  );
  const levels = reduceMotion ? staticHistory : history;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const nextLevel = normalizeMetering(metering);
    const animationFrame = requestAnimationFrame(() => {
      setHistory((current) =>
        [...current.slice(1), nextLevel].slice(-barCount),
      );
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [metering, reduceMotion]);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      {levels.map((level, index) => {
        const isCurrent = index === levels.length - 1;

        return (
          <View
            key={`${index}-${isCurrent ? 'current' : 'past'}`}
            style={[
              styles.bar,
              {
                backgroundColor: isCurrent
                  ? colors.amber
                  : withAlpha(colors.lavender, 0.8),
                height: Math.max(7, Math.round(trackHeight * level)),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.pill,
    flex: 1,
    maxWidth: 5,
    minWidth: 3,
  },
  root: {
    alignItems: 'flex-end',
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.xxs,
    height: trackHeight,
    justifyContent: 'center',
    maxWidth: 220,
    width: '72%',
  },
});
