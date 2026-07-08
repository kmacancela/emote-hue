import { readJson, removeItem, writeJson } from './storage';

export const TRANSCRIPT_KEY = '@emote-hue/privacy-save-transcripts';
export const TYPE_SCALE_KEY = '@emote-hue/type-scale';
export const READBACK_VOICE_KEY = '@emote-hue/readback-voice';

export type TypeScale = 'cozy' | 'regular' | 'roomy';

const typeScaleValues = new Set<TypeScale>(['cozy', 'regular', 'roomy']);

export async function readSaveTranscripts(): Promise<boolean> {
  return readJson<boolean>(TRANSCRIPT_KEY, true);
}

export async function writeSaveTranscripts(value: boolean) {
  await writeJson(TRANSCRIPT_KEY, value);
}

export async function readTypeScale(): Promise<TypeScale> {
  const stored = await readJson<unknown>(TYPE_SCALE_KEY, 'regular');

  return typeof stored === 'string' && typeScaleValues.has(stored as TypeScale)
    ? (stored as TypeScale)
    : 'regular';
}

export async function writeTypeScale(value: TypeScale) {
  await writeJson(TYPE_SCALE_KEY, value);
}

export async function readReadbackVoice(): Promise<string | undefined> {
  const stored = await readJson<unknown>(READBACK_VOICE_KEY, undefined);

  return typeof stored === 'string' && stored.trim().length > 0
    ? stored
    : undefined;
}

export async function writeReadbackVoice(value: string | undefined) {
  if (value) {
    await writeJson(READBACK_VOICE_KEY, value);
    return;
  }

  await removeItem(READBACK_VOICE_KEY);
}
