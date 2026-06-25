import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Screen } from '@/src/components/Screen';
import { colors, spacing } from '@/src/theme';

export default function NotFoundScreen() {
  return (
    <Screen center scroll={false}>
      <Stack.Screen options={{ title: 'Not found' }} />
      <BrandText variant="title">This Hue space is not here.</BrandText>
      <Link href="/" style={styles.link}>
        <BrandText>Return home</BrandText>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: {
    color: colors.mist,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
});
