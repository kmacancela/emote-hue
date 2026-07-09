import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';
import type { ScrollView } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { FlowHeader } from '@/src/components/FlowHeader';
import { MicOrb } from '@/src/components/MicOrb';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { ReflectionVoiceStatus } from '@/src/components/ReflectionVoiceStatus';
import { Screen } from '@/src/components/Screen';
import { WaveformBars } from '@/src/components/WaveformBars';
import {
  maxDurationMillis,
  useAudioRecorder,
} from '@/src/hooks/useAudioRecorder';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useSpeechTranscription } from '@/src/hooks/useSpeechTranscription';
import { markDraftPending, startCreateDraft } from '@/src/lib/createDraft';
import { colors, radius, spacing, typography } from '@/src/theme';

function formatElapsedTime(durationMillis: number) {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function RecordScreen() {
  const router = useRouter();
  const appliedTranscriptRef = useRef('');
  const draftStarted = useRef(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const userEditedAfterTranscriptRef = useRef(false);
  const wasRecordingRef = useRef(false);
  const [reflection, setReflection] = useState('');
  const [textOnly, setTextOnly] = useState(false);
  const recorder = useAudioRecorder();
  const reduceMotion = useReducedMotion();
  const transcription = useSpeechTranscription();
  const hasTranscript = reflection.trim().length > 0;
  const canContinue =
    hasTranscript || Boolean(recorder.recordingUri);
  const remainingSeconds = Math.ceil(
    Math.max(0, maxDurationMillis - recorder.durationMillis) / 1000,
  );
  const showRecordingWarning = recorder.isRecording && remainingSeconds <= 10;

  useEffect(() => {
    return () => {
      if (draftStarted.current) {
        void markDraftPending();
      }
    };
  }, []);

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
    draftStarted.current = true;
    router.push('/create/portrait');
  }

  return (
    <Screen scrollRef={scrollRef}>
      <FlowHeader step={1} totalSteps={2} />
      <View style={styles.stack}>
        <BrandText variant="title">Tell me how you feel right now.</BrandText>
        <BrandText muted>
          Speak, type, or both. A few words are enough.
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
              <WaveformBars
                metering={recorder.metering}
                reduceMotion={reduceMotion}
              />
              <BrandText muted variant="small">
                {formatElapsedTime(recorder.durationMillis)}
              </BrandText>
            </View>
          ) : null}
        </View>
      ) : null}

      <ReflectionVoiceStatus
        hasTranscript={hasTranscript}
        interimTranscript={transcription.interimTranscript}
        isRecording={recorder.isRecording}
        recorderError={recorder.error}
        recordingUri={recorder.recordingUri}
        remainingSeconds={remainingSeconds}
        showRecordingWarning={showRecordingWarning}
        transcriptionError={transcription.error}
        transcriptionUnavailable={!textOnly && !transcription.isAvailable}
      />

      <TextInput
        accessibilityLabel="Typed reflection"
        multiline
        onChangeText={handleReflectionChange}
        onFocus={() => {
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: !reduceMotion });
          }, 120);
        }}
        placeholder="Type a few words, or edit the transcript here."
        placeholderTextColor={colors.mistMuted}
        style={styles.input}
        textAlignVertical="top"
        value={reflection}
      />

      <PrivacyNotice>
        Raw audio is not saved by default. Saved entries stay on this device in
        this version.
      </PrivacyNotice>

      <Button disabled={!canContinue} onPress={continueToPortrait}>
        Create portrait
      </Button>
      <Button onPress={() => setTextOnly((value) => !value)} variant="ghost">
        {textOnly ? 'Show voice option' : 'Type instead'}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
