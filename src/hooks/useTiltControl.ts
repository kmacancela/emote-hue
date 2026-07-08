import { useEffect, useRef, useState } from 'react';
import { DeviceMotion } from 'expo-sensors';

type TiltDelta = {
  x: number;
  y: number;
};

type UseTiltControlOptions = {
  enabled: boolean;
  onDelta: (delta: TiltDelta) => void;
};

const ALPHA = 0.15;
const DEADZONE_DEGREES = 1.5;
const OUTPUT_SCALE_DEGREES = 36;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeDegrees(value: number) {
  if (Math.abs(value) < DEADZONE_DEGREES) {
    return 0;
  }

  return clamp(value / OUTPUT_SCALE_DEGREES, -1, 1);
}

export function useTiltControl({ enabled, onDelta }: UseTiltControlOptions) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const onDeltaRef = useRef(onDelta);

  useEffect(() => {
    onDeltaRef.current = onDelta;
  }, [onDelta]);

  useEffect(() => {
    let isActive = true;

    DeviceMotion.isAvailableAsync()
      .then((available) => {
        if (isActive) {
          setIsAvailable(available);
        }
      })
      .catch(() => {
        if (isActive) {
          setIsAvailable(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || isAvailable !== true) {
      return;
    }

    DeviceMotion.setUpdateInterval(120);

    let originBeta: number | null = null;
    let originGamma: number | null = null;
    let smoothBeta = 0;
    let smoothGamma = 0;

    const subscription = DeviceMotion.addListener((measurement) => {
      const beta = measurement.rotation?.beta;
      const gamma = measurement.rotation?.gamma;

      if (typeof beta !== 'number' || typeof gamma !== 'number') {
        return;
      }

      originBeta ??= beta;
      originGamma ??= gamma;

      smoothBeta += (beta - originBeta - smoothBeta) * ALPHA;
      smoothGamma += (gamma - originGamma - smoothGamma) * ALPHA;

      onDeltaRef.current({
        x: normalizeDegrees(smoothGamma),
        y: normalizeDegrees(smoothBeta),
      });
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, isAvailable]);

  return { isAvailable };
}
