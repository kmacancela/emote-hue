import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme';

type ButtonProps = PropsWithChildren<{
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}>;

export function Button({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  variant = 'primary',
}: ButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.inner}>
        <Text
          style={[
            styles.label,
            variant === 'primary' && styles.primaryLabel,
            variant === 'ghost' && styles.ghostLabel,
          ]}
          numberOfLines={2}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  danger: {
    backgroundColor: '#3A1822',
    borderColor: colors.danger,
    borderWidth: StyleSheet.hairlineWidth,
  },
  disabled: {
    opacity: 0.45,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  ghostLabel: {
    color: colors.mistMuted,
  },
  inner: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  label: {
    color: colors.mist,
    flexShrink: 1,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  primary: {
    backgroundColor: colors.lavender,
  },
  primaryLabel: {
    color: colors.ink,
  },
  secondary: {
    backgroundColor: colors.inkSoft,
    borderColor: colors.lineStrong,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
