import { readJson, writeJson } from './storage';

export const TRANSCRIPT_KEY = '@emote-hue/privacy-save-transcripts';

export async function readSaveTranscripts(): Promise<boolean> {
  return readJson<boolean>(TRANSCRIPT_KEY, true);
}

export async function writeSaveTranscripts(value: boolean) {
  await writeJson(TRANSCRIPT_KEY, value);
}
