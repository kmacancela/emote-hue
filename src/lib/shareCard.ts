import type { RefObject } from 'react';
import { Platform } from 'react-native';
import type { View } from 'react-native';
import { makeImageFromView } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { ShareCardFormat } from '@/src/components/ShareCard';

type ShareEntryCardParams = {
  format: ShareCardFormat;
  id: string;
  viewRef: RefObject<View | null>;
};

function createShareCardId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export async function shareEntryCard({
  format,
  id,
  viewRef,
}: ShareEntryCardParams): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable || !viewRef.current) {
      return false;
    }

    const image = await makeImageFromView(viewRef);
    const bytes = image?.encodeToBytes();

    if (!bytes || bytes.length === 0) {
      return false;
    }

    const file = new File(
      Paths.cache,
      `emote-hue-${id}-${format}-${createShareCardId()}.png`,
    );

    file.write(bytes);

    await Sharing.shareAsync(file.uri, {
      UTI: 'public.png',
      dialogTitle: 'Share Emote Hue card',
      mimeType: 'image/png',
    });

    return true;
  } catch {
    return false;
  }
}
