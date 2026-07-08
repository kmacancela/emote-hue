import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { MicOrb } from '@/src/components/MicOrb';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { WaveformBars } from '@/src/components/WaveformBars';
import {
  maxDurationMillis,
  useAudioRecorder,
} from '@/src/hooks/useAudioRecorder';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useSpeechTranscription } from '@/src/hooks/useSpeechTranscription';
import { startCreateDraft } from '@/src/lib/createDraft';
import { colors, radius, spacing, typography } from '@/src/theme';

function formatElapsedTime(durationMillis: number) {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function FirstCheckInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const appliedTranscriptRef = useRef('');
  const userEditedAfterTranscriptRef = useRef(false);
  const wasRecordingRef = useRef(false);
  const [reflection, setReflection] = useState('');
  const recorder = useAudioRecorder();
  const reduceMotion = useReducedMotion();
  const transcription = useSpeechTranscription();
  const typedMode = params.mode === 'text';
  const canContinue =
    reflection.trim().length > 0 || Boolean(recorder.recordingUri);
  const remainingSeconds = Math.ceil(
    Math.max(0, maxDurationMillis - recorder.durationMillis) / 1000,
  );
  const showRecordingWarning = recorder.isRecording && remainingSeconds <= 10;

  useEffect(() => {
    if (recorder.isRecording) {
      wasRecordingRef.current = true;
      return;
    }

    if (wasRecordingRef.current) {
      wasRecordingRef.current = false;
      transcription.stop();
    }
  }, [recorder.isRecording, transcription]);

  useEffect(() => {
    const transcript = transcription.transcript.trim();

    if (
      recorder.isRecording ||
      !recorder.recordingUri ||
      !transcript ||
      userEditedAfterTranscriptRef.current
    ) {
      return;
    }

    appliedTranscriptRef.current = transcript;
    setReflection(transcript);
  }, [recorder.isRecording, recorder.recordingUri, transcription.transcript]);

  async function handleMicPress() {
    if (recorder.isRecording) {
      transcription.stop();
      await recorder.stopRecording();
      return;
    }

    transcription.reset();
    appliedTranscriptRef.current = '';
    userEditedAfterTranscriptRef.current = false;

    const didStartRecording = await recorder.startRecording();

    if (didStartRecording) {
      void transcription.start();
    }
  }

  function handleReflectionChange(value: string) {
    setReflection(value);

    if (value !== appliedTranscriptRef.current) {
      userEditedAfterTranscriptRef.current = true;
    }
  }

  async function continueToPortrait() {
    const mode = recorder.recordingUri ? 'voice' : 'text';
    const text =
      reflection.trim() ||
      'A private voice reflection was recorded and will be translated by the mock local hue engine.';

    await startCreateDraft(mode, text, recorder.recordingUri);
    router.push('/create/portrait?first=1');
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
        <View style={styles.micStack}>
          <MicOrb
            metering={recorder.metering}
            onPress={handleMicPress}
            reduceMotion={reduceMotion}
            state={recorder.uiState}
          />
          {recorder.isRecording ? (
            <View style={styles.recordingMeta}>
              <WaveformBars
                metering={recorder.metering}
                reduceMotion={reduceMotion}
              />
              <BrandText muted variant="small">
                {formatElapsedTime(recorder.durationMillis)}
              </BrandText>
              {transcription.interimTranscript.trim() ? (
                <BrandText muted style={styles.hearingText} variant="small">
                  Hearing: {transcription.interimTranscript.trim()}
                </BrandText>
              ) : null}
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
      {!typedMode && !transcription.isAvailable ? (
        <BrandText muted variant="small">
          {
            "Transcription isn't available on this device — your voice still shapes the portrait."
          }
        </BrandText>
      ) : null}
      {transcription.error ? (
        <BrandText muted variant="small">
          {transcription.error}
        </BrandText>
      ) : null}
      {recorder.recordingUri ? (
        <BrandText muted variant="small">
          Voice reflection captured for this local mock flow.
        </BrandText>
      ) : null}

      <TextInput
        accessibilityLabel="Type your feeling"
        multiline
        onChangeText={handleReflectionChange}
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

      <Button disabled={!canContinue} onPress={continueToPortrait}>
        Create portrait
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
  },
  hearingText: {
    textAlign: 'center',
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
