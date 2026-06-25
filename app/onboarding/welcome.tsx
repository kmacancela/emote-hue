import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { HueCanvas } from '@/src/components/HueCanvas';
import { Screen } from '@/src/components/Screen';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import { colors, spacing } from '@/src/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen center scroll={false}>
      <View style={styles.hero}>
        <HueCanvas analysis={sampleHueAnalysis} style={styles.art} />
        <View style={styles.copy}>
          <BrandText variant="hero">Emote Hue</BrandText>
          <BrandText muted variant="lead">
            {"When words aren't enough, color speaks."}
          </BrandText>
        </View>
      </View>
      <Button onPress={() => router.push('/onboarding/concept')}>Begin</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: {
    alignSelf: 'center',
    maxWidth: 440,
  },
  copy: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
  hero: {
    backgroundColor: colors.transparent,
    gap: spacing.xl,
  },
});
