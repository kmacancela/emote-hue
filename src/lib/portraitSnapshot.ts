import type { RefObject } from 'react';
import { Platform } from 'react-native';
import type { CanvasRef } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';

function createSnapshotId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export async function capturePortraitSnapshot(
  ref: RefObject<CanvasRef | null> | null | undefined,
): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    return undefined;
  }

  try {
    const canvas = ref?.current;

    if (!canvas) {
      return undefined;
    }

    const image = await canvas.makeImageSnapshotAsync();
    const bytes = image.encodeToBytes();

    if (bytes.length === 0) {
      return undefined;
    }

    const file = new File(Paths.document, `portrait-${createSnapshotId()}.png`);

    file.write(bytes);

    return file.uri;
  } catch {
    return undefined;
  }
}
