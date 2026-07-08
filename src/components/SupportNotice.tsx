import { Feather } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { colors, radius, spacing, typography } from '@/src/theme';

const resources = [
  {
    icon: 'phone',
    label: 'Call or text 988 (US Suicide & Crisis Lifeline)',
    url: 'tel:988',
  },
  {
    icon: 'globe',
    label: 'Find international helplines',
    url: 'https://findahelpline.com',
  },
] as const;

export function SupportNotice() {
  return (
    <View style={styles.notice}>
      <BrandText>
        This sounds really heavy. Emote Hue can help you express what you feel,
        but it cannot provide emergency support. Consider reaching out to
        someone you trust or a local crisis resource now.
      </BrandText>
      <View style={styles.resources}>
        {resources.map((resource) => (
          <Pressable
            accessibilityLabel={resource.label}
            accessibilityRole="button"
            key={resource.url}
            onPress={() => {
              void Linking.openURL(resource.url);
            }}
            style={({ pressed }) => [
              styles.resourceRow,
              pressed && styles.pressed,
            ]}
          >
            <Feather color={colors.mist} name={resource.icon} size={18} />
            <BrandText style={styles.resourceText} variant="small">
              {resource.label}
            </BrandText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#2A1D24',
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.76,
  },
  resourceRow: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  resourceText: {
    flex: 1,
    fontWeight: typography.weight.semibold,
  },
  resources: {
    gap: spacing.xs,
  },
});
