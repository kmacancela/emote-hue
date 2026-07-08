import { File } from 'expo-file-system';

export async function deleteFileQuietly(
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
    // Local privacy cleanup is best-effort; missing files are fine.
  }
}
