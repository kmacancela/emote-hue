import { File } from 'expo-file-system';

export async function deleteRecordingFile(
  uri: string | undefined,
): Promise<void> {
  if (!uri) {
    return;
  }

  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch {
    // Recording files are best-effort privacy cleanup; missing files are fine.
  }
}
