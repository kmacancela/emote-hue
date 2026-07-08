import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { MicOrb } from '@/src/components/MicOrb';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import {
  maxDurationMillis,
  useAudioRecorder,
} from '@/src/hooks/useAudioRecorder';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { startCreateDraft } from '@/src/lib/createDraft';
import { colors, radius, spacing, typography } from '@/src/theme';

function formatElapsedTime(durationMillis: number) {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function RecordScreen() {
  const router = useRouter();
  const [reflection, setReflection] = useState('');
  const [textOnly, setTextOnly] = useState(false);
  const recorder = useAudioRecorder();
  const reduceMotion = useReducedMotion();
  const canContinue =
    reflection.trim().length > 0 || Boolean(recorder.recordingUri);
  const remainingSeconds = Math.ceil(
    Math.max(0, maxDurationMillis - recorder.durationMillis) / 1000,
  );
  const showRecordingWarning = recorder.isRecording && remainingSeconds <= 10;

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
    router.push('/create/intensity');
  }

  return (
    <Screen>
      <View style={styles.stack}>
        <BrandText variant="title">Speak or type what feels present.</BrandText>
        <BrandText muted>
          A few words are enough. You can also choose color and intensity
          without explaining.
        </BrandText>
      </View>

      {!textOnly ? (
        <View style={styles.micStack}>
          <MicOrb
            metering={recorder.metering}
            onPress={handleMicPress}
            reduceMotion={reduceMotion}
            state={recorder.uiState}
          />
          {recorder.isRecording ? (
            <View style={styles.recordingMeta}>
              <BrandText muted variant="small">
                {formatElapsedTime(recorder.durationMillis)}
              </BrandText>
              {showRecordingWarning ? (
                <BrandText style={styles.recordingWarning} variant="small">
                  Wrapping up soon — {remainingSeconds}s left.
                </BrandText>
              ) : null}
            </View>
          ) : null}
        </View>
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
        accessibilityLabel="Typed reflection"
        multiline
        onChangeText={setReflection}
        placeholder="Type here..."
        placeholderTextColor={colors.smoke}
        style={styles.input}
        textAlignVertical="top"
        value={reflection}
      />

      <PrivacyNotice>
        Raw audio is not saved by default. This milestone stores only a local
        mock entry after you save.
      </PrivacyNotice>

      <Button disabled={!canContinue} onPress={continueToIntensity}>
        Continue to intensity
      </Button>
      <Button onPress={() => setTextOnly((value) => !value)} variant="ghost">
        {textOnly ? 'Show voice option' : 'Type instead'}
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
    minHeight: 144,
    padding: spacing.md,
  },
  micStack: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    gap: spacing.xs,
  },
  recordingMeta: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    gap: spacing.xs,
  },
  recordingWarning: {
    color: colors.amber,
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
