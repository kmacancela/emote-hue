import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { deleteRecordingFile } from '@/src/lib/recordingFiles';

export type RecorderUiState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'processing'
  | 'error';

export const maxDurationMillis = 45000;

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const hasObservedRecording = useRef(false);
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

  const finalizeRecording = useCallback(() => {
    const uri = recorder.uri ?? recorder.getStatus().url ?? undefined;

    setRecordingUri(uri);
    setUiState('idle');
    return uri;
  }, [recorder]);

  useEffect(() => {
    if (recorderState.isRecording) {
      hasObservedRecording.current = true;
      return;
    }

    if (uiState !== 'recording' || !hasObservedRecording.current) {
      return;
    }

    hasObservedRecording.current = false;

    queueMicrotask(() => {
      try {
        finalizeRecording();
      } catch {
        setUiState('error');
        setError(
          'Recording did not save. You can try again or type your feeling instead.',
        );
      }
    });
  }, [finalizeRecording, recorderState.isRecording, uiState]);

  const startRecording = useCallback(async () => {
    await deleteRecordingFile(recordingUri);
    hasObservedRecording.current = false;
    setRecordingUri(undefined);

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
      recorder.record({ forDuration: maxDurationMillis / 1000 });
      setUiState('recording');
      return true;
    } catch {
      setUiState('error');
      setError(
        'Recording did not start. You can try again or type your feeling instead.',
      );
      return false;
    }
  }, [recorder, recordingUri, requestPermission]);

  const stopRecording = useCallback(async () => {
    try {
      setUiState('processing');
      await recorder.stop();
      hasObservedRecording.current = false;
      return finalizeRecording();
    } catch {
      setUiState('error');
      setError(
        'Recording did not save. You can try again or type your feeling instead.',
      );
      return undefined;
    }
  }, [finalizeRecording, recorder]);

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
