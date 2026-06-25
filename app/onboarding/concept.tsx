import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { HueCanvas } from '@/src/components/HueCanvas';
import { Screen } from '@/src/components/Screen';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import { colors, spacing } from '@/src/theme';

export default function ConceptScreen() {
  const router = useRouter();

  return (
    <Screen center>
      <View style={styles.stack}>
        <BrandText variant="title">
          Speak how you feel, and Emote Hue turns it into a living color
          portrait.
        </BrandText>
      </View>
      <HueCanvas
        analysis={sampleHueAnalysis}
        reduceMotion
        style={styles.preview}
      />
      <Button onPress={() => router.push('/onboarding/calibration')}>
        Try it
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    alignSelf: 'center',
    maxWidth: 380,
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
