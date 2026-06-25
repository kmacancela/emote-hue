import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme';

type EmotionChipsProps = {
  labels: string[];
  selectedLabels?: string[];
  onToggle?: (label: string) => void;
};

export function EmotionChips({
  labels,
  onToggle,
  selectedLabels = [],
}: EmotionChipsProps) {
  return (
    <View style={styles.wrap}>
      {labels.map((label) => {
        const isSelected = selectedLabels.includes(label);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={label}
            onPress={() => onToggle?.(label)}
            style={[styles.chip, isSelected && styles.selectedChip]}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.mistMuted,
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.small,
  },
  selectedChip: {
    backgroundColor: colors.mist,
    borderColor: colors.mist,
  },
  selectedLabel: {
    color: colors.ink,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
