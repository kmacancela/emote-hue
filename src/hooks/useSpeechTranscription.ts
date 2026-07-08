import { useCallback, useEffect, useState } from 'react';
import type {
  ExpoSpeechRecognitionNativeEventMap,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

type SpeechRecognitionApi = typeof import('expo-speech-recognition');
type SpeechRecognitionModule =
  SpeechRecognitionApi['ExpoSpeechRecognitionModule'];
type SpeechRecognitionNativeEvents = {
  [K in keyof ExpoSpeechRecognitionNativeEventMap]: (
    event: ExpoSpeechRecognitionNativeEventMap[K],
  ) => void;
};

declare const require:
  | ((moduleName: 'expo-speech-recognition') => SpeechRecognitionApi)
  | undefined;

function loadSpeechRecognitionApi(): SpeechRecognitionApi | null {
  try {
    if (typeof require !== 'function') {
      return null;
    }

    return require('expo-speech-recognition');
  } catch {
    return null;
  }
}

const speechRecognitionApi = loadSpeechRecognitionApi();
const ExpoSpeechRecognitionModule =
  speechRecognitionApi?.ExpoSpeechRecognitionModule;
const useSafeSpeechRecognitionEvent =
  speechRecognitionApi?.useSpeechRecognitionEvent ?? useNoopRecognitionEvent;

function useNoopRecognitionEvent<K extends keyof SpeechRecognitionNativeEvents>(
  _eventName: K,
  _listener: SpeechRecognitionNativeEvents[K],
) {
  useEffect(() => undefined, []);
}

function getRecognitionAvailable(module: SpeechRecognitionModule | undefined) {
  if (!module) {
    return false;
  }

  try {
    if (typeof module.isRecognitionAvailable === 'function') {
      return module.isRecognitionAvailable();
    }

    return true;
  } catch {
    return false;
  }
}

function getPrimaryTranscript(event: ExpoSpeechRecognitionResultEvent) {
  return event.results[0]?.transcript.trim() ?? '';
}

function joinTranscript(current: string, next: string) {
  const trimmedCurrent = current.trim();
  const trimmedNext = next.trim();

  if (!trimmedCurrent) {
    return trimmedNext;
  }

  if (!trimmedNext || trimmedCurrent.endsWith(trimmedNext)) {
    return trimmedCurrent;
  }

  return `${trimmedCurrent} ${trimmedNext}`;
}

export function useSpeechTranscription() {
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(() =>
    getRecognitionAvailable(ExpoSpeechRecognitionModule),
  );

  useSafeSpeechRecognitionEvent('result', (event) => {
    const text = getPrimaryTranscript(event);

    if (!text) {
      return;
    }

    if (event.isFinal) {
      setFinalTranscript((current) => joinTranscript(current, text));
      setInterimTranscript('');
      return;
    }

    setInterimTranscript(text);
  });

  useSafeSpeechRecognitionEvent('error', (event) => {
    setError(event.message || 'Transcription paused.');
  });

  useSafeSpeechRecognitionEvent('end', () => {
    setIsTranscribing(false);
  });

  const reset = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    try {
      const available = getRecognitionAvailable(ExpoSpeechRecognitionModule);
      setIsAvailable(available);

      if (!available || !ExpoSpeechRecognitionModule) {
        return false;
      }

      const permissions =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permissions.granted) {
        setError(
          'Transcription permission is off. You can still record or type instead.',
        );
        return false;
      }

      setFinalTranscript('');
      setInterimTranscript('');
      ExpoSpeechRecognitionModule.start({
        continuous: true,
        interimResults: true,
        lang: 'en-US',
      });
      setIsTranscribing(true);
      return true;
    } catch {
      setIsAvailable(false);
      setIsTranscribing(false);
      setError('Transcription is not available on this device.');
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule?.stop();
    } catch {
      setError('Transcription stopped before it could finish.');
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const transcript = joinTranscript(finalTranscript, interimTranscript);

  return {
    error,
    interimTranscript,
    isAvailable,
    isTranscribing,
    reset,
    start,
    stop,
    transcript,
  };
}
