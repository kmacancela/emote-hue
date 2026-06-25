import type { CreateDraft, HueAnalysis, ReflectionMode } from '@/src/types/hue';
import { readJson, removeItem, writeJson } from './storage';

const DRAFT_KEY = '@emote-hue/create-draft';

export async function loadCreateDraft() {
  return readJson<CreateDraft | null>(DRAFT_KEY, null);
}

export async function saveCreateDraft(draft: CreateDraft) {
  await writeJson(DRAFT_KEY, draft);
}

export async function startCreateDraft(
  mode: ReflectionMode,
  reflection: string,
  recordingUri?: string,
) {
  const draft: CreateDraft = {
    mode,
    reflection,
    recordingUri,
    intensity: 5,
    startedAt: new Date().toISOString(),
  };

  await saveCreateDraft(draft);
  return draft;
}

export async function updateDraftIntensity(intensity: number) {
  const draft = await loadCreateDraft();

  if (!draft) {
    return null;
  }

  const next = { ...draft, intensity };
  await saveCreateDraft(next);
  return next;
}

export async function updateDraftAnalysis(analysis: HueAnalysis) {
  const draft = await loadCreateDraft();

  if (!draft) {
    return null;
  }

  const next = { ...draft, analysis };
  await saveCreateDraft(next);
  return next;
}

export async function clearCreateDraft() {
  await removeItem(DRAFT_KEY);
}
