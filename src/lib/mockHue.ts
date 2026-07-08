import type { ColorCalibration, HueAnalysis } from '@/src/types/hue';
import { clamp, fallbackHueAnalysis } from '@/src/utils/color';

const highDistressWords =
  /(can't keep going|cannot keep going|hopeless|panic|terrified|desperate)/i;
const crisisWords =
  /(suicide|kill myself|end my life|hurt myself|self harm|self-harm)/i;

function getIntensityMotion(
  intensity: number,
): HueAnalysis['visual']['motion'] {
  if (intensity > 7) {
    return 'bloom';
  }

  if (intensity > 4) {
    return 'soft_pulse';
  }

  return 'still';
}

function hasWarmIntensityBonus(analysis: HueAnalysis) {
  return analysis.visual.warmth >= 0.65;
}

export function applyIntensity(
  analysis: HueAnalysis,
  intensityHint: number,
): HueAnalysis {
  const next = fallbackHueAnalysis(analysis);
  const intensity = Math.round(clamp(intensityHint, 1, 10));
  const warmBonus = hasWarmIntensityBonus(next) ? 0.08 : 0;

  return {
    ...next,
    intensity,
    arousal: clamp(intensity / 10, 0, 1),
    visual: {
      ...next.visual,
      motion: getIntensityMotion(intensity),
      brightness: clamp(0.32 + intensity * 0.045 + warmBonus, 0, 1),
      particleDensity: clamp(0.12 + intensity * 0.055, 0, 1),
      animationSpeed: clamp(0.14 + intensity * 0.06, 0, 1),
    },
  };
}

export const sampleHueAnalysis = fallbackHueAnalysis({
  primaryEmotion: 'overwhelmed anticipation',
  secondaryEmotions: ['excitement', 'uncertainty', 'pressure'],
  emotionWords: ['overwhelmed', 'excited', 'stretched', 'hopeful'],
  intensity: 7,
  valence: 0.15,
  arousal: 0.82,
  palette: [
    {
      hex: '#2B1D4F',
      role: 'base',
      weight: 0.44,
      meaning: 'depth and pressure',
    },
    { hex: '#6C4AB6', role: 'shadow', weight: 0.24, meaning: 'uncertainty' },
    { hex: '#F6A85D', role: 'accent', weight: 0.2, meaning: 'hope and energy' },
    { hex: '#F4A6C1', role: 'light', weight: 0.12, meaning: 'tender optimism' },
  ],
  visual: {
    composition: 'center_bloom',
    motion: 'soft_pulse',
    texture: 'soft_grain',
    brightness: 0.62,
    warmth: 0.48,
    edgeSoftness: 0.58,
    particleDensity: 0.42,
    animationSpeed: 0.54,
  },
  userFacingSummary:
    'This hue feels like a deep pressure with a warm edge of possibility.',
});

export function createMockHueAnalysis(
  reflection: string,
  intensityHint: number,
  calibration: ColorCalibration[] = [],
): HueAnalysis {
  const text = reflection.trim();
  const lower = text.toLowerCase();
  const intensity = Math.round(clamp(intensityHint, 1, 10));
  const isTender = /(tired|soft|sad|quiet|tender|miss)/i.test(lower);
  const isWarm = /(hope|excited|grateful|love|proud|ready)/i.test(lower);
  const isCharged = /(angry|overwhelmed|stressed|nervous|pressure|fast)/i.test(
    lower,
  );
  const crisisLanguage = crisisWords.test(text);
  const highDistress = crisisLanguage || highDistressWords.test(text);
  const firstCalibration = calibration.find((item) => item.labels.length > 0);
  const calibratedWord = firstCalibration?.labels[0];

  const palette = isWarm
    ? [
        {
          hex: '#211735',
          role: 'base' as const,
          weight: 0.38,
          meaning: 'private depth',
        },
        {
          hex: '#F6A85D',
          role: 'accent' as const,
          weight: 0.28,
          meaning: 'warm lift',
        },
        {
          hex: '#F4A6C1',
          role: 'light' as const,
          weight: 0.2,
          meaning: 'tender brightness',
        },
        {
          hex: '#92C7A3',
          role: 'neutral' as const,
          weight: 0.14,
          meaning: 'steadying air',
        },
      ]
    : isTender
      ? [
          {
            hex: '#111018',
            role: 'base' as const,
            weight: 0.42,
            meaning: 'quiet shelter',
          },
          {
            hex: '#3F315B',
            role: 'shadow' as const,
            weight: 0.24,
            meaning: 'soft weight',
          },
          {
            hex: '#A78BFA',
            role: 'accent' as const,
            weight: 0.18,
            meaning: 'small shimmer',
          },
          {
            hex: '#D8D6E8',
            role: 'light' as const,
            weight: 0.16,
            meaning: 'gentle room',
          },
        ]
      : [
          {
            hex: '#111018',
            role: 'base' as const,
            weight: 0.4,
            meaning: 'dark quiet',
          },
          {
            hex: '#2B1D4F',
            role: 'shadow' as const,
            weight: 0.24,
            meaning: 'emotional depth',
          },
          {
            hex: '#A78BFA',
            role: 'accent' as const,
            weight: 0.22,
            meaning: 'inner signal',
          },
          {
            hex: '#F6A85D',
            role: 'light' as const,
            weight: 0.14,
            meaning: 'small heat',
          },
        ];

  const analysis = fallbackHueAnalysis({
    primaryEmotion: isCharged
      ? 'charged reflection'
      : isTender
        ? 'tender quiet'
        : 'open reflection',
    secondaryEmotions: [
      isWarm ? 'warmth' : 'depth',
      isCharged ? 'pressure' : 'softness',
      calibratedWord ?? 'curiosity',
    ],
    emotionWords: [
      isCharged ? 'charged' : 'reflective',
      isWarm ? 'warm' : 'deep',
      isTender ? 'tender' : 'shifting',
      calibratedWord ?? 'personal',
    ],
    intensity,
    valence: isWarm ? 0.35 : isTender ? -0.18 : 0.02,
    palette,
    visual: {
      composition: isCharged
        ? 'liquid_ribbon'
        : isTender
          ? 'mist_field'
          : 'center_bloom',
      motion: 'still',
      texture: isTender ? 'velvet' : isWarm ? 'glow' : 'soft_grain',
      brightness: 0.48,
      warmth: isWarm ? 0.72 : isTender ? 0.42 : 0.5,
      edgeSoftness: isCharged ? 0.46 : 0.72,
      particleDensity: 0.22,
      animationSpeed: 0.28,
    },
    userFacingSummary: highDistress
      ? 'This hue may be holding a very heavy feeling with a small protected edge of light.'
      : 'This hue feels like a private color field shaped by what you shared.',
    safetyFlags: {
      highDistress,
      crisisLanguage,
      selfHarmLanguage: crisisLanguage,
    },
  });

  return applyIntensity(analysis, intensity);
}
