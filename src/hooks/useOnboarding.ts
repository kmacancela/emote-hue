import { useCallback, useEffect, useState } from 'react';

import { readJson, writeJson } from '@/src/lib/storage';

const ONBOARDING_KEY = '@emote-hue/onboarding-completed';

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const stored = await readJson<boolean>(ONBOARDING_KEY, false);
    setCompleted(stored);
    setIsLoading(false);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await writeJson(ONBOARDING_KEY, true);
    setCompleted(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await writeJson(ONBOARDING_KEY, false);
    setCompleted(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    readJson<boolean>(ONBOARDING_KEY, false).then((stored) => {
      if (isMounted) {
        setCompleted(stored);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { completed, completeOnboarding, isLoading, refresh, resetOnboarding };
}
