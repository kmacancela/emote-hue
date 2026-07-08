export type PaletteRole = 'base' | 'shadow' | 'accent' | 'light' | 'neutral';

export type HueComposition =
  | 'center_bloom'
  | 'horizon_wave'
  | 'orbital_aura'
  | 'mist_field'
  | 'ember_field'
  | 'liquid_ribbon';

export type HueMotion =
  | 'still'
  | 'slow_drift'
  | 'soft_pulse'
  | 'wave'
  | 'flicker'
  | 'bloom';

export type HueTexture =
  | 'soft_grain'
  | 'fog'
  | 'watercolor'
  | 'velvet'
  | 'ink'
  | 'glow';

export type HuePaletteColor = {
  hex: string;
  role: PaletteRole;
  weight: number;
  meaning: string;
};

export type HueAnalysis = {
  primaryEmotion: string;
  secondaryEmotions: string[];
  emotionWords: string[];
  intensity: number;
  valence: number;
  arousal: number;
  palette: HuePaletteColor[];
  visual: {
    composition: HueComposition;
    motion: HueMotion;
    texture: HueTexture;
    brightness: number;
    warmth: number;
    edgeSoftness: number;
    particleDensity: number;
    animationSpeed: number;
  };
  userFacingSummary: string;
  safetyFlags: {
    highDistress: boolean;
    crisisLanguage: boolean;
    selfHarmLanguage: boolean;
  };
};

export type ColorCalibration = {
  id: string;
  hex: string;
  labels: string[];
  customLabel?: string;
  createdAt: string;
};

export type HueEntry = {
  id: string;
  createdAt: string;
  title?: string;
  privateNote?: string;
  staticPreviewUri?: string;
  transcriptSummary?: string;
  transcript?: string;
  intensity: number;
  primaryEmotion: string;
  emotionWords: string[];
  analysis: HueAnalysis;
};

export type HueAdjustment =
  | 'softer'
  | 'brighter'
  | 'deeper'
  | 'more_still'
  | 'more_alive';

export type ReflectionMode = 'voice' | 'text';

export type CreateDraft = {
  mode: ReflectionMode;
  reflection: string;
  recordingUri?: string;
  intensity: number;
  analysis?: HueAnalysis;
  startedAt: string;
  status?: 'pending' | 'active';
};
