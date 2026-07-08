import { deleteFileQuietly } from './fileCleanup';

export async function deleteRecordingFile(
  uri: string | undefined,
): Promise<void> {
  await deleteFileQuietly(uri);
}
