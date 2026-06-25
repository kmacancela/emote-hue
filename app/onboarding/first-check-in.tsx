import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { MicOrb } from '@/src/components/MicOrb';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { useAudioRecorder } from '@/src/hooks/useAudioRecorder';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { startCreateDraft } from '@/src/lib/createDraft';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function FirstCheckInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [reflection, setReflection] = useState('');
  const recorder = useAudioRecorder();
  const reduceMotion = useReducedMotion();
  const typedMode = params.mode === 'text';
  const canContinue =
    reflection.trim().length > 0 || Boolean(recorder.recordingUri);

  async function handleMicPress() {
    if (recorder.isRecording) {
      await recorder.stopRecording();
      return;
    }

    await recorder.startRecording();
  }

  async function continueToIntensity() {
    const mode = recorder.recordingUri && !reflection.trim() ? 'voice' : 'text';
    const text =
      reflection.trim() ||
      'A private voice reflection was recorded and will be translated by the mock local hue engine.';

    await startCreateDraft(mode, text, recorder.recordingUri);
    router.push('/create/intensity?first=1');
  }

  return (
    <Screen>
      <View style={styles.stack}>
        <BrandText variant="title">
          Say a few words about how you feel right now.
        </BrandText>
        <BrandText muted>
          {
            "You can be honest, vague, messy, or quiet for a moment. There's no right way."
          }
        </BrandText>
      </View>

      {!typedMode ? (
        <MicOrb
          metering={recorder.metering}
          onPress={handleMicPress}
          reduceMotion={reduceMotion}
          state={recorder.uiState}
        />
      ) : null}

      {recorder.error ? (
        <BrandText style={styles.error}>{recorder.error}</BrandText>
      ) : null}
      {recorder.recordingUri ? (
        <BrandText muted variant="small">
          Voice reflection captured for this local mock flow.
        </BrandText>
      ) : null}

      <TextInput
        accessibilityLabel="Type your feeling"
        multiline
        onChangeText={setReflection}
        placeholder="Type a few words instead..."
        placeholderTextColor={colors.smoke}
        style={styles.input}
        textAlignVertical="top"
        value={reflection}
      />

      <PrivacyNotice>
        The MVP mock does not upload audio or call OpenAI. Later backend
        integration must keep API keys server-side.
      </PrivacyNotice>

      <Button disabled={!canContinue} onPress={continueToIntensity}>
        Continue to intensity
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
  },
  input: {
    backgroundColor: colors.inkSoft,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.mist,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    minHeight: 132,
    padding: spacing.md,
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
