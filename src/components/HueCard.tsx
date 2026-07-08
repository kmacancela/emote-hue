import { Image, Pressable, StyleSheet, View } from 'react-native';

import type { HueEntry } from '@/src/types/hue';
import { colors, radius, spacing } from '@/src/theme';
import { formatShortDate } from '@/src/utils/date';
import { BrandText } from './BrandText';
import { HueCanvas } from './HueCanvas';

type HueCardProps = {
  entry: HueEntry;
  onPress?: () => void;
};

export function HueCard({ entry, onPress }: HueCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Open Hue Entry from ${formatShortDate(entry.createdAt)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {entry.staticPreviewUri ? (
        <Image
          resizeMode="cover"
          source={{ uri: entry.staticPreviewUri }}
          style={[styles.art, styles.staticPreview]}
        />
      ) : (
        <HueCanvas
          analysis={entry.analysis}
          interactive={false}
          preview
          reduceMotion
          seedKey={entry.id}
          style={styles.art}
        />
      )}
      <View style={styles.meta}>
        <BrandText variant="small">
          {entry.title || formatShortDate(entry.createdAt)}
        </BrandText>
        <BrandText muted variant="caption">
          Intensity {entry.intensity}/10
        </BrandText>
      </View>
      <View style={styles.palette}>
        {entry.analysis.palette.map((color) => (
          <View
            key={`${entry.id}-${color.hex}-${color.role}`}
            style={[styles.swatch, { backgroundColor: color.hex }]}
          />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  art: {
    aspectRatio: 1.1,
  },
  card: {
    backgroundColor: '#181421',
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    minWidth: 0,
    padding: spacing.sm,
  },
  meta: {
    backgroundColor: colors.transparent,
    gap: spacing.xxs,
  },
  palette: {
    borderRadius: radius.pill,
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  staticPreview: {
    backgroundColor: colors.inkRaised,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
  },
  swatch: {
    flex: 1,
  },
});
