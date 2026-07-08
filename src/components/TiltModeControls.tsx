import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { colors, radius, spacing, typography } from '@/src/theme';

export type TiltMode = 'touch' | 'intensity' | 'warmthLight';

type TiltModeControlsProps = {
  disabled?: boolean;
  isAvailable?: boolean | null;
  mode: TiltMode;
  onModeChange: (mode: TiltMode) => void;
};

const modes: { label: string; value: TiltMode }[] = [
  { label: 'Touch', value: 'touch' },
  { label: 'Tilt: Intensity', value: 'intensity' },
  { label: 'Tilt: Warmth & Light', value: 'warmthLight' },
];

export function TiltModeControls({
  disabled,
  isAvailable,
  mode,
  onModeChange,
}: TiltModeControlsProps) {
  const tiltUnavailable = isAvailable === false;
  const tiltDisabled = disabled || tiltUnavailable;
  const isTiltMode = mode !== 'touch';

  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        {modes.map((item) => {
          const selected = mode === item.value;
          const itemDisabled = item.value !== 'touch' && tiltDisabled;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: itemDisabled,
                selected,
              }}
              disabled={itemDisabled}
              key={item.value}
              onPress={() => onModeChange(item.value)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.selectedChip,
                itemDisabled && styles.disabledChip,
                pressed && !itemDisabled && styles.pressed,
              ]}
            >
              <Text
                numberOfLines={2}
                style={[styles.label, selected && styles.selectedLabel]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {disabled ? (
        <BrandText muted variant="small">
          Tilt controls are off while reduce motion is on.
        </BrandText>
      ) : tiltUnavailable ? (
        <BrandText muted variant="small">
          Tilt controls are not available on this device.
        </BrandText>
      ) : isTiltMode ? (
        <BrandText muted variant="small">
          Tilt your phone gently — the portrait follows.
        </BrandText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.inkSoft,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  disabledChip: {
    opacity: 0.45,
  },
  label: {
    color: colors.mist,
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.small,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
  row: {
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  selectedChip: {
    backgroundColor: colors.lavender,
    borderColor: colors.lavender,
  },
  selectedLabel: {
    color: colors.ink,
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.xs,
  },
});
