import type {
  HueAdjustment,
  HueAnalysis,
  HuePaletteColor,
} from '@/src/types/hue';

const HEX_RE = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i;

export const fallbackPalette: HuePaletteColor[] = [
  { hex: '#111018', role: 'base', weight: 0.5, meaning: 'quiet space' },
  { hex: '#6C4AB6', role: 'accent', weight: 0.3, meaning: 'inner color' },
  { hex: '#D8D6E8', role: 'light', weight: 0.2, meaning: 'soft reflection' },
];

export function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function isValidHexColor(value: string) {
  return HEX_RE.test(value);
}

export function sanitizeHex(value: string | undefined, fallback = '#111018') {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();
  return isValidHexColor(normalized) ? normalized : fallback;
}

export function withAlpha(hex: string, alpha: number) {
  const safe = sanitizeHex(hex).slice(0, 7);
  const channel = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');

  return `${safe}${channel}`;
}

export function normalizePalette(palette: HuePaletteColor[] | undefined) {
  const cleaned = (palette ?? [])
    .filter((color) => isValidHexColor(color.hex))
    .map((color) => ({
      ...color,
      weight: clamp(color.weight, 0, 1),
      hex: sanitizeHex(color.hex),
    }));

  return cleaned.length > 0 ? cleaned : fallbackPalette;
}

export function fallbackHueAnalysis(
  partial?: Partial<HueAnalysis>,
): HueAnalysis {
  return {
    primaryEmotion: partial?.primaryEmotion ?? 'soft reflection',
    secondaryEmotions: partial?.secondaryEmotions ?? ['quiet', 'open'],
    emotionWords: partial?.emotionWords ?? ['quiet', 'open'],
    intensity: clamp(partial?.intensity ?? 4, 1, 10),
    valence: clamp(partial?.valence ?? 0, -1, 1),
    arousal: clamp(partial?.arousal ?? 0.35, 0, 1),
    palette: normalizePalette(partial?.palette),
    visual: {
      composition: partial?.visual?.composition ?? 'center_bloom',
      motion: partial?.visual?.motion ?? 'slow_drift',
      texture: partial?.visual?.texture ?? 'soft_grain',
      brightness: clamp(partial?.visual?.brightness ?? 0.48, 0, 1),
      warmth: clamp(partial?.visual?.warmth ?? 0.48, 0, 1),
      edgeSoftness: clamp(partial?.visual?.edgeSoftness ?? 0.68, 0, 1),
      particleDensity: clamp(partial?.visual?.particleDensity ?? 0.22, 0, 1),
      animationSpeed: clamp(partial?.visual?.animationSpeed ?? 0.28, 0, 1),
    },
    userFacingSummary:
      partial?.userFacingSummary ??
      'This hue feels like a quiet field with room to shift.',
    safetyFlags: {
      highDistress: partial?.safetyFlags?.highDistress ?? false,
      crisisLanguage: partial?.safetyFlags?.crisisLanguage ?? false,
      selfHarmLanguage: partial?.safetyFlags?.selfHarmLanguage ?? false,
    },
  };
}

export function normalizeHueAnalysis(analysis: HueAnalysis) {
  return fallbackHueAnalysis({
    ...analysis,
    palette: normalizePalette(analysis.palette),
  });
}

export function applyHueAdjustment(
  analysis: HueAnalysis,
  adjustment: HueAdjustment,
): HueAnalysis {
  const next = normalizeHueAnalysis(analysis);
  const visual = { ...next.visual };

  if (adjustment === 'softer') {
    visual.edgeSoftness = clamp(visual.edgeSoftness + 0.12, 0, 1);
    visual.particleDensity = clamp(visual.particleDensity - 0.1, 0, 1);
    visual.brightness = clamp(visual.brightness + 0.03, 0, 1);
  }

  if (adjustment === 'brighter') {
    visual.brightness = clamp(visual.brightness + 0.12, 0, 1);
    visual.warmth = clamp(visual.warmth + 0.06, 0, 1);
  }

  if (adjustment === 'deeper') {
    visual.brightness = clamp(visual.brightness - 0.1, 0, 1);
    visual.edgeSoftness = clamp(visual.edgeSoftness - 0.05, 0, 1);
  }

  if (adjustment === 'more_still') {
    visual.motion = 'still';
    visual.animationSpeed = clamp(visual.animationSpeed - 0.18, 0, 1);
    visual.particleDensity = clamp(visual.particleDensity - 0.08, 0, 1);
  }

  if (adjustment === 'more_alive') {
    visual.motion =
      next.visual.motion === 'still' ? 'soft_pulse' : next.visual.motion;
    visual.animationSpeed = clamp(visual.animationSpeed + 0.16, 0, 1);
    visual.particleDensity = clamp(visual.particleDensity + 0.12, 0, 1);
  }

  return {
    ...next,
    visual,
  };
}
