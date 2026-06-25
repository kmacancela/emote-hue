import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { HueCanvas } from '@/src/components/HueCanvas';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import { colors, spacing } from '@/src/theme';
import { formatEntryDate } from '@/src/utils/date';

export default function HomeScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { latestEntry } = useHueEntries();
  const { width } = useWindowDimensions();
  const isTablet = width >= 780;
  const activeAnalysis = latestEntry?.analysis ?? sampleHueAnalysis;

  return (
    <Screen center={!isTablet}>
      <View style={[styles.layout, isTablet && styles.tabletLayout]}>
        <View style={styles.copy}>
          <BrandText variant="title">
            {latestEntry
              ? 'Your most recent Hue is resting here.'
              : 'A quiet Hue space is waiting.'}
          </BrandText>
          <BrandText muted>
            {latestEntry
              ? `Last saved ${formatEntryDate(latestEntry.createdAt)}.`
              : 'Start with voice or text, then adjust the color until it feels close.'}
          </BrandText>
          <Button onPress={() => router.push('/create/record')}>
            Create Hue Entry
          </Button>
        </View>

        <View style={styles.canvasColumn}>
          <HueCanvas analysis={activeAnalysis} reduceMotion={reduceMotion} />
          <PrivacyNotice>
            Entries are private by default. The current MVP stores saved entries
            locally on this device.
          </PrivacyNotice>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvasColumn: {
    backgroundColor: colors.transparent,
    flex: 1,
    gap: spacing.md,
  },
  copy: {
    backgroundColor: colors.transparent,
    flex: 1,
    gap: spacing.md,
  },
  layout: {
    backgroundColor: colors.transparent,
    gap: spacing.xl,
  },
  tabletLayout: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
