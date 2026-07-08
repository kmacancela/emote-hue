import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';

import { readReadbackVoice } from '@/src/lib/settings';

export function useReadback() {
  const [voice, setVoice] = useState<string | undefined>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    readReadbackVoice()
      .then((storedVoice) => {
        if (mountedRef.current) {
          setVoice(storedVoice);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setVoice(undefined);
        }
      });

    return () => {
      mountedRef.current = false;
      Speech.stop().catch(() => undefined);
    };
  }, []);

  const stop = useCallback(() => {
    setIsSpeaking(false);
    void Speech.stop().catch(() => undefined);
  }, []);

  const speak = useCallback(
    (text: string) => {
      const trimmedText = text.trim();

      if (!trimmedText) {
        return;
      }

      Speech.stop()
        .catch(() => undefined)
        .finally(() => {
          try {
            Speech.speak(trimmedText, {
              onDone: () => {
                if (mountedRef.current) {
                  setIsSpeaking(false);
                }
              },
              onError: () => {
                if (mountedRef.current) {
                  setIsSpeaking(false);
                }
              },
              onStart: () => {
                if (mountedRef.current) {
                  setIsSpeaking(true);
                }
              },
              onStopped: () => {
                if (mountedRef.current) {
                  setIsSpeaking(false);
                }
              },
              pitch: 1,
              rate: 0.92,
              voice,
            });
          } catch {
            if (mountedRef.current) {
              setIsSpeaking(false);
            }
          }
        });
    },
    [voice],
  );

  return {
    isSpeaking,
    speak,
    stop,
  };
}
