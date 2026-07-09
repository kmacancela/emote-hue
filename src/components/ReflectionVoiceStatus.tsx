import { StyleSheet } from 'react-native';

import { colors } from '@/src/theme';
import { BrandText } from './BrandText';

type ReflectionVoiceStatusProps = {
  hasTranscript: boolean;
  interimTranscript: string;
  isRecording: boolean;
  recordingUri?: string;
  recorderError?: string | null;
  remainingSeconds: number;
  showRecordingWarning: boolean;
  transcriptionError?: string | null;
  transcriptionUnavailable: boolean;
};

export function ReflectionVoiceStatus({
  hasTranscript,
  interimTranscript,
  isRecording,
  recordingUri,
  recorderError,
  remainingSeconds,
  showRecordingWarning,
  transcriptionError,
  transcriptionUnavailable,
}: ReflectionVoiceStatusProps) {
  if (recorderError) {
    return (
      <BrandText style={styles.error} variant="small">
        {recorderError}
      </BrandText>
    );
  }

  if (showRecordingWarning) {
    return (
      <BrandText style={styles.warning} variant="small">
        Wrapping up soon: {remainingSeconds}s left.
      </BrandText>
    );
  }

  const interim = interimTranscript.trim();

  if (isRecording && interim) {
    return (
      <BrandText muted style={styles.status} variant="small">
        Hearing: {interim}
      </BrandText>
    );
  }

  if (isRecording) {
    return (
      <BrandText muted style={styles.status} variant="small">
        Listening...
      </BrandText>
    );
  }

  if (transcriptionError) {
    return (
      <BrandText muted style={styles.status} variant="small">
        {transcriptionError}
      </BrandText>
    );
  }

  if (recordingUri && hasTranscript) {
    return (
      <BrandText muted style={styles.status} variant="small">
        Transcript added below. You can edit it before creating the portrait.
      </BrandText>
    );
  }

  if (recordingUri) {
    return (
      <BrandText muted style={styles.status} variant="small">
        Voice captured. Type a few words too if you want text saved.
      </BrandText>
    );
  }

  if (transcriptionUnavailable) {
    return (
      <BrandText muted style={styles.status} variant="small">
        Speech-to-text is unavailable here. You can still type instead.
      </BrandText>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  status: {
    textAlign: 'center',
  },
  warning: {
    color: colors.amber,
    textAlign: 'center',
  },
});
