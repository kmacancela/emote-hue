import { useCallback, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export type RecorderUiState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'processing'
  | 'error';

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [uiState, setUiState] = useState<RecorderUiState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | undefined>();

  const requestPermission = useCallback(async () => {
    setUiState('requesting_permission');
    const response = await requestRecordingPermissionsAsync();

    if (!response.granted) {
      setUiState('error');
      setError(
        'Microphone access is off. You can turn it on in settings or type your feeling instead.',
      );
      return false;
    }

    setUiState('idle');
    setError(null);
    return true;
  }, []);

  const startRecording = useCallback(async () => {
    const hasPermission = await requestPermission();

    if (!hasPermission) {
      return false;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync({ isMeteringEnabled: true });
      recorder.record({ forDuration: 45 });
      setRecordingUri(undefined);
      setUiState('recording');
      return true;
    } catch {
      setUiState('error');
      setError(
        'Recording did not start. You can try again or type your feeling instead.',
      );
      return false;
    }
  }, [recorder, requestPermission]);

  const stopRecording = useCallback(async () => {
    try {
      setUiState('processing');
      await recorder.stop();
      const uri = recorder.uri ?? recorder.getStatus().url ?? undefined;
      setRecordingUri(uri);
      setUiState('idle');
      return uri;
    } catch {
      setUiState('error');
      setError(
        'Recording did not save. You can try again or type your feeling instead.',
      );
      return undefined;
    }
  }, [recorder]);

  const resetRecording = useCallback(() => {
    setRecordingUri(undefined);
    setError(null);
    setUiState('idle');
  }, []);

  return {
    durationMillis: recorderState.durationMillis,
    error,
    isRecording: recorderState.isRecording,
    metering: recorderState.metering,
    recordingUri,
    requestPermission,
    resetRecording,
    startRecording,
    stopRecording,
    uiState,
  };
}
