import { useSyncExternalStore } from 'react';

import {
  readTypeScale,
  type TypeScale,
  writeTypeScale,
} from '@/src/lib/settings';

export const TYPE_SCALE_FACTORS: Record<TypeScale, number> = {
  cozy: 0.92,
  regular: 1,
  roomy: 1.12,
};

let currentTypeScale: TypeScale = 'regular';
let hasStartedStorageRead = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getTypeScale() {
  return currentTypeScale;
}

export function getTypeScaleFactor() {
  return TYPE_SCALE_FACTORS[currentTypeScale];
}

export function subscribeTypeScale(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setTypeScaleSnapshot(value: TypeScale) {
  if (currentTypeScale === value) {
    return;
  }

  currentTypeScale = value;
  emit();
}

export async function initializeTypeScaleFromStorage() {
  if (hasStartedStorageRead) {
    return;
  }

  hasStartedStorageRead = true;
  const stored = await readTypeScale();
  setTypeScaleSnapshot(stored);
}

export async function persistTypeScale(value: TypeScale) {
  setTypeScaleSnapshot(value);
  await writeTypeScale(value);
}

export function useTypeScaleStore() {
  return useSyncExternalStore(subscribeTypeScale, getTypeScale, getTypeScale);
}
