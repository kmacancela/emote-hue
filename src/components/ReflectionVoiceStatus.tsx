import { StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/src/theme';
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

function splitLatestWord(text: string) {
  const match = /^(.*\s)(\S+)$/.exec(text);

  if (!match) {
    return { latest: text, rest: '' };
  }

  return { latest: match[2], rest: match[1] };
}

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
    const { latest, rest } = splitLatestWord(interim);

    return (
      <Text style={styles.hearing}>
        <Text style={styles.hearingLabel}>Hearing: </Text>
        {rest ? <Text style={styles.hearingRest}>{rest}</Text> : null}
        <Text style={styles.hearingPhrase}>{latest}</Text>
      </Text>
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
    return null;
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
  hearing: {
    color: colors.mistMuted,
    fontFamily: typography.family.body,
    fontSize: typography.size.small,
    lineHeight: typography.lineHeight.small,
    textAlign: 'center',
  },
  hearingLabel: {
    color: colors.mistMuted,
  },
  hearingPhrase: {
    color: colors.amber,
    fontWeight: typography.weight.semibold,
  },
  hearingRest: {
    color: colors.mistMuted,
  },
  status: {
    textAlign: 'center',
  },
  warning: {
    color: colors.amber,
    textAlign: 'center',
  },
});
