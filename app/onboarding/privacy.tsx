import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { useAudioRecorder } from '@/src/hooks/useAudioRecorder';
import { colors, spacing } from '@/src/theme';

export default function PrivacyScreen() {
  const router = useRouter();
  const { error, requestPermission } = useAudioRecorder();
  const [isRequesting, setIsRequesting] = useState(false);

  async function handleAllowMicrophone() {
    setIsRequesting(true);
    const granted = await requestPermission();
    setIsRequesting(false);

    if (granted) {
      router.push('/onboarding/first-check-in');
    }
  }

  return (
    <Screen center>
      <View style={styles.stack}>
        <BrandText variant="title">
          Your voice helps shape tone, pace, and intensity.
        </BrandText>
        <BrandText muted>
          Emote Hue uses your microphone only when you choose to record a Hue
          Entry.
        </BrandText>
      </View>
      <PrivacyNotice>
        Your entries are private by default. Raw audio is not saved by default.
        You decide what gets saved.
      </PrivacyNotice>
      {error ? <BrandText style={styles.error}>{error}</BrandText> : null}
      <Button disabled={isRequesting} onPress={handleAllowMicrophone}>
        {isRequesting ? 'Requesting microphone' : 'Allow microphone'}
      </Button>
      <Button
        onPress={() => router.push('/onboarding/first-check-in?mode=text')}
        variant="secondary"
      >
        Type instead
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
