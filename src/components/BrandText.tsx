import type { PropsWithChildren } from 'react';
import type { TextProps } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/src/theme';

type BrandTextProps = PropsWithChildren<
  TextProps & {
    variant?: 'hero' | 'title' | 'lead' | 'body' | 'small' | 'caption';
    muted?: boolean;
  }
>;

export function BrandText({
  children,
  muted,
  style,
  variant = 'body',
  ...props
}: BrandTextProps) {
  return (
    <Text
      {...props}
      style={[styles.base, styles[variant], muted && styles.muted, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.mist,
    fontFamily: typography.family.body,
  },
  body: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.body,
  },
  caption: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.caption,
  },
  hero: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.hero,
  },
  lead: {
    fontSize: typography.size.lead,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.lead,
  },
  muted: {
    color: colors.mistMuted,
  },
  small: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.regular,
    lineHeight: typography.lineHeight.small,
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.title,
  },
});
