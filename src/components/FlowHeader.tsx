import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/src/theme';

type FlowHeaderProps = {
  step: 1 | 2 | 3;
};

const steps = [1, 2, 3] as const;

export function FlowHeader({ step }: FlowHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel="Back"
        accessibilityRole="button"
        hitSlop={spacing.xs}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather color={colors.mist} name="chevron-left" size={24} />
      </Pressable>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.dots}
      >
        {steps.map((item) => (
          <View
            key={item}
            style={[styles.dot, item === step && styles.activeDot]}
          />
        ))}
      </View>
      <View style={styles.sideSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: colors.amber,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  dot: {
    backgroundColor: colors.line,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  root: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
  },
  sideSpacer: {
    width: 44,
  },
});
