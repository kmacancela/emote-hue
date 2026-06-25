import { z } from 'zod';

export const paletteRoleSchema = z.enum([
  'base',
  'shadow',
  'accent',
  'light',
  'neutral',
]);

export const hueCompositionSchema = z.enum([
  'center_bloom',
  'horizon_wave',
  'orbital_aura',
  'mist_field',
  'ember_field',
  'liquid_ribbon',
]);

export const hueMotionSchema = z.enum([
  'still',
  'slow_drift',
  'soft_pulse',
  'wave',
  'flicker',
  'bloom',
]);

export const hueTextureSchema = z.enum([
  'soft_grain',
  'fog',
  'watercolor',
  'velvet',
  'ink',
  'glow',
]);

export const huePaletteColorSchema = z.object({
  hex: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i),
  role: paletteRoleSchema,
  weight: z.number().min(0).max(1),
  meaning: z.string().min(1),
});

export const hueAnalysisSchema = z.object({
  primaryEmotion: z.string().min(1),
  secondaryEmotions: z.array(z.string().min(1)),
  emotionWords: z.array(z.string().min(1)),
  intensity: z.number().min(1).max(10),
  valence: z.number().min(-1).max(1),
  arousal: z.number().min(0).max(1),
  palette: z.array(huePaletteColorSchema).min(3).max(5),
  visual: z.object({
    composition: hueCompositionSchema,
    motion: hueMotionSchema,
    texture: hueTextureSchema,
    brightness: z.number().min(0).max(1),
    warmth: z.number().min(0).max(1),
    edgeSoftness: z.number().min(0).max(1),
    particleDensity: z.number().min(0).max(1),
    animationSpeed: z.number().min(0).max(1),
  }),
  userFacingSummary: z.string().min(1),
  safetyFlags: z.object({
    highDistress: z.boolean(),
    crisisLanguage: z.boolean(),
    selfHarmLanguage: z.boolean(),
  }),
});

export const hueEntrySchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  title: z.string().optional(),
  privateNote: z.string().optional(),
  transcriptSummary: z.string().optional(),
  transcript: z.string().optional(),
  intensity: z.number().min(1).max(10),
  primaryEmotion: z.string().min(1),
  emotionWords: z.array(z.string()),
  analysis: hueAnalysisSchema,
});

export function parseHueAnalysis(value: unknown) {
  return hueAnalysisSchema.parse(value);
}

export function safeParseHueAnalysis(value: unknown) {
  return hueAnalysisSchema.safeParse(value);
}
