import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function gentleSelection() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Haptics.selectionAsync();
  } catch {
    // Haptics should never block an emotional check-in.
  }
}

export async function gentleSuccess() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics are additive, not required.
  }
}
