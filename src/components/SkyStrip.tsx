import { useMemo } from 'react';
import type { ColorValue } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { HueEntry } from '@/src/types/hue';
import { colors, radius, spacing } from '@/src/theme';
import {
  formatShortDate,
  getLastDays,
  groupEntriesByDay,
} from '@/src/utils/date';
import { BrandText } from './BrandText';

type SkyStripProps = {
  entries: HueEntry[];
  onPressEntry?: (id: string) => void;
};

function gradientColors(
  entry: HueEntry,
): readonly [ColorValue, ColorValue, ...ColorValue[]] {
  const paletteColors = entry.analysis.palette.map((color) => color.hex);
  const first = paletteColors[0] ?? colors.ink;
  const second = paletteColors[1] ?? first;

  return [first, second, ...paletteColors.slice(2)];
}

export function SkyStrip({ entries, onPressEntry }: SkyStripProps) {
  const days = useMemo(() => getLastDays(30), []);
  const entriesByDay = useMemo(
    () => groupEntriesByDay(entries, days),
    [days, entries],
  );

  return (
    <View style={styles.stack}>
      <View style={styles.strip}>
        {entriesByDay.map((entry, index) => {
          const day = days[index];
          const key = day.toISOString();

          if (!entry) {
            return (
              <View
                accessible={false}
                importantForAccessibility="no"
                key={key}
                style={[styles.band, styles.emptyBand]}
              />
            );
          }

          return (
            <Pressable
              accessibilityLabel={`Hue from ${formatShortDate(entry.createdAt)}`}
              accessibilityRole="button"
              key={key}
              onPress={() => onPressEntry?.(entry.id)}
              style={({ pressed }) => [
                styles.band,
                pressed && styles.pressedBand,
              ]}
            >
              <LinearGradient
                colors={gradientColors(entry)}
                end={{ x: 0.5, y: 1 }}
                start={{ x: 0.5, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Pressable>
          );
        })}
      </View>
      <BrandText muted style={styles.caption} variant="small">
        The last 30 days, woven.
      </BrandText>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  caption: {
    textAlign: 'center',
  },
  emptyBand: {
    backgroundColor: colors.ink,
  },
  pressedBand: {
    opacity: 0.72,
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.xs,
  },
  strip: {
    backgroundColor: colors.ink,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 72,
    overflow: 'hidden',
  },
});
