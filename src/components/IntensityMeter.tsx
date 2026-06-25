import { Pressable, StyleSheet, Text, View } from 'react-native';

import { gentleSelection } from '@/src/lib/haptics';
import { colors, radius, spacing, typography } from '@/src/theme';

type IntensityMeterProps = {
  labels?: { min: string; max: string };
  onChange: (value: number) => void;
  suggestedValue?: number;
  value: number;
};

export function IntensityMeter({
  labels = { min: 'Quiet', max: 'Intense' },
  onChange,
  suggestedValue,
  value,
}: IntensityMeterProps) {
  const values = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <View
      accessibilityLabel={`Feeling intensity ${value} out of 10`}
      accessibilityRole="adjustable"
      style={styles.container}
    >
      <View style={styles.rail}>
        {values.map((level) => {
          const active = level <= value;
          const suggested = level === suggestedValue;

          return (
            <Pressable
              accessibilityLabel={`Set intensity to ${level} out of 10`}
              accessibilityRole="button"
              key={level}
              onPress={() => {
                gentleSelection();
                onChange(level);
              }}
              style={[
                styles.step,
                active && styles.activeStep,
                suggested && styles.suggestedStep,
                { height: 26 + level * 6 },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>{labels.min}</Text>
        <Text style={styles.value}>{value}/10</Text>
        <Text style={styles.label}>{labels.max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeStep: {
    backgroundColor: colors.amber,
  },
  container: {
    gap: spacing.md,
  },
  label: {
    color: colors.mistMuted,
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
  },
  labels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rail: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 96,
  },
  step: {
    backgroundColor: colors.inkSoft,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    minHeight: 44,
  },
  suggestedStep: {
    borderColor: colors.mist,
    borderWidth: 1,
  },
  value: {
    color: colors.mist,
    fontSize: typography.size.lead,
    fontWeight: typography.weight.bold,
  },
});
