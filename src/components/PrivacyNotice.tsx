import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';
import { BrandText } from './BrandText';

type PrivacyNoticeProps = {
  children: string;
};

export function PrivacyNotice({ children }: PrivacyNoticeProps) {
  return (
    <View style={styles.notice}>
      <BrandText variant="caption">Private by default</BrandText>
      <BrandText muted>{children}</BrandText>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#1A1624',
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.md,
  },
});
