import type { HueAnalysis, PaletteRole } from '@/src/types/hue';
import { clamp, normalizeHueAnalysis } from '@/src/utils/color';
import { createPrng, hashSeed } from './prng';

export type PortraitGeometry = {
  particles: {
    x: number;
    y: number;
    r: number;
    colorRole: 'light' | 'accent';
    opacity: number;
  }[];
  blooms: {
    cx: number;
    cy: number;
    r: number;
    role: PaletteRole;
    opacity: number;
  }[];
  ribbonPoints?: { x: number; y: number }[];
  gradientStops: { color: string; position: number }[];
  grain?: { x: number; y: number; r: number; opacity: number }[];
};

type Prng = () => number;

const rolePriority: Record<PaletteRole, number> = {
  accent: 2,
  base: 0,
  light: 3,
  neutral: 2,
  shadow: 1,
};

const roleTieBreak: Record<PaletteRole, number> = {
  accent: 0,
  base: 0,
  light: 0,
  neutral: 1,
  shadow: 0,
};

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function randomBetween(prng: Prng, min: number, max: number) {
  return min + prng() * (max - min);
}

function randomInt(prng: Prng, min: number, max: number) {
  return Math.floor(randomBetween(prng, min, max + 1));
}

function buildGradientStops(analysis: HueAnalysis) {
  const weightedPalette = analysis.palette
    .map((color, index) => {
      const accentLimit =
        analysis.intensity > 7 ? 1 : 0.12 + analysis.intensity * 0.008;
      const effectiveWeight =
        color.role === 'accent'
          ? Math.min(color.weight, accentLimit)
          : color.weight;

      return {
        color,
        effectiveWeight: Math.max(effectiveWeight, 0.001),
        index,
      };
    })
    .sort((left, right) => {
      const priorityDiff =
        rolePriority[left.color.role] - rolePriority[right.color.role];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const tieDiff =
        roleTieBreak[left.color.role] - roleTieBreak[right.color.role];

      return tieDiff !== 0 ? tieDiff : left.index - right.index;
    });

  if (weightedPalette.length === 1) {
    return [
      { color: weightedPalette[0].color.hex, position: 0 },
      { color: weightedPalette[0].color.hex, position: 1 },
    ];
  }

  const totalWeight = weightedPalette.reduce(
    (total, entry) => total + entry.effectiveWeight,
    0,
  );
  let cumulative = weightedPalette[0].effectiveWeight / totalWeight;

  return weightedPalette.map((entry, index) => {
    if (index === 0) {
      return { color: entry.color.hex, position: 0 };
    }

    if (index === weightedPalette.length - 1) {
      return { color: entry.color.hex, position: 1 };
    }

    const position = clamp01(cumulative);
    cumulative += entry.effectiveWeight / totalWeight;

    return { color: entry.color.hex, position };
  });
}

function buildParticles(analysis: HueAnalysis, prng: Prng) {
  const density = analysis.visual.particleDensity;
  const particleCount = 4 + Math.round(density * 20);
  const opacityMultiplier = analysis.visual.texture === 'velvet' ? 0.68 : 1;
  const maxRadius = 1.5 + density * 4.5;

  return Array.from({ length: particleCount }, (_, index) => ({
    colorRole: index % 2 === 0 ? ('light' as const) : ('accent' as const),
    opacity: clamp01(randomBetween(prng, 0.14, 0.3) * opacityMultiplier),
    r: randomBetween(prng, 1.5, maxRadius) / 100,
    x: randomBetween(prng, 0.03, 0.97),
    y: randomBetween(prng, 0.03, 0.97),
  }));
}

function createBloomFactory(analysis: HueAnalysis, prng: Prng) {
  const { brightness, edgeSoftness, texture } = analysis.visual;
  const radiusVariance =
    (0.018 + (1 - edgeSoftness) * 0.055) * (texture === 'watercolor' ? 1.9 : 1);
  const radiusMultiplier = texture === 'fog' ? 1.18 : 1;
  const opacityMultiplier =
    (0.68 + brightness * 0.64) *
    (texture === 'fog' ? 0.7 : 1) *
    (texture === 'glow' ? 1.15 : 1);

  return (
    cx: number,
    cy: number,
    r: number,
    role: PaletteRole,
    opacity: number,
  ) => ({
    cx: clamp01(cx),
    cy: clamp01(cy),
    opacity: clamp01(opacity * opacityMultiplier),
    r: clamp(
      (r + randomBetween(prng, -radiusVariance, radiusVariance)) *
        radiusMultiplier,
      0.03,
      0.95,
    ),
    role,
  });
}

function buildCenterBloom(analysis: HueAnalysis, prng: Prng) {
  const bloom = createBloomFactory(analysis, prng);
  const satelliteCount = randomInt(prng, 1, 2);
  const blooms = [bloom(0.5, 0.5, 0.42, 'accent', 0.26)];

  for (let index = 0; index < satelliteCount; index += 1) {
    const angle = randomBetween(prng, 0, Math.PI * 2);
    const distance = randomBetween(prng, 0.18, 0.28);

    blooms.push(
      bloom(
        0.5 + Math.cos(angle) * distance,
        0.5 + Math.sin(angle) * distance,
        randomBetween(prng, 0.18, 0.28),
        index % 2 === 0 ? 'light' : 'neutral',
        randomBetween(prng, 0.1, 0.16),
      ),
    );
  }

  return blooms;
}

function buildHorizonWave(analysis: HueAnalysis, prng: Prng) {
  const bloom = createBloomFactory(analysis, prng);
  const lowCount = randomInt(prng, 2, 3);
  const blooms = Array.from({ length: lowCount }, (_, index) => {
    const x = lowCount === 2 ? 0.32 + index * 0.36 : 0.18 + index * 0.32;

    return bloom(
      x + randomBetween(prng, -0.06, 0.06),
      randomBetween(prng, 0.62, 0.72),
      randomBetween(prng, 0.36, 0.52),
      index % 2 === 0 ? 'accent' : 'light',
      randomBetween(prng, 0.12, 0.18),
    );
  });

  blooms.push(
    bloom(
      randomBetween(prng, 0.2, 0.8),
      randomBetween(prng, 0.16, 0.28),
      randomBetween(prng, 0.2, 0.32),
      'neutral',
      randomBetween(prng, 0.05, 0.09),
    ),
  );

  return blooms;
}

function buildOrbitalAura(analysis: HueAnalysis, prng: Prng) {
  const bloom = createBloomFactory(analysis, prng);
  const count = randomInt(prng, 4, 6);
  const angleOffset = randomBetween(prng, 0, Math.PI * 2);

  return Array.from({ length: count }, (_, index) => {
    const angle =
      angleOffset +
      (index / count) * Math.PI * 2 +
      randomBetween(prng, -0.16, 0.16);
    const ringRadius = randomBetween(prng, 0.26, 0.34);

    return bloom(
      0.5 + Math.cos(angle) * ringRadius,
      0.5 + Math.sin(angle) * ringRadius,
      randomBetween(prng, 0.16, 0.24),
      index % 3 === 0 ? 'accent' : index % 3 === 1 ? 'light' : 'neutral',
      randomBetween(prng, 0.11, 0.18),
    );
  });
}

function buildMistField(analysis: HueAnalysis, prng: Prng) {
  const bloom = createBloomFactory(analysis, prng);
  const count = randomInt(prng, 5, 7);

  return Array.from({ length: count }, (_, index) =>
    bloom(
      randomBetween(prng, 0.08, 0.92),
      randomBetween(prng, 0.08, 0.92),
      randomBetween(prng, 0.28, 0.48),
      index % 2 === 0 ? 'light' : 'neutral',
      randomBetween(prng, 0.045, 0.085),
    ),
  );
}

function buildEmberField(analysis: HueAnalysis, prng: Prng) {
  const bloom = createBloomFactory(analysis, prng);
  const count = randomInt(prng, 8, 12);

  return Array.from({ length: count }, (_, index) =>
    bloom(
      randomBetween(prng, 0.06, 0.94),
      randomBetween(prng, 0.5, 0.95),
      randomBetween(prng, 0.055, 0.13),
      index % 3 === 0 ? 'light' : 'accent',
      randomBetween(prng, 0.08, 0.16),
    ),
  );
}

function buildLiquidRibbon(analysis: HueAnalysis, prng: Prng) {
  const bloom = createBloomFactory(analysis, prng);
  const count = randomInt(prng, 5, 8);
  const start = {
    x: randomBetween(prng, 0.06, 0.16),
    y: randomBetween(prng, 0.66, 0.84),
  };
  const end = {
    x: randomBetween(prng, 0.84, 0.94),
    y: randomBetween(prng, 0.18, 0.34),
  };
  const bend = randomBetween(prng, -0.16, 0.16);
  const ribbonPoints = Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0 : index / (count - 1);
    const curve = Math.sin(progress * Math.PI) * bend;

    return {
      x: clamp01(
        start.x +
          (end.x - start.x) * progress +
          randomBetween(prng, -0.035, 0.035),
      ),
      y: clamp01(
        start.y +
          (end.y - start.y) * progress +
          curve +
          randomBetween(prng, -0.035, 0.035),
      ),
    };
  });
  const blooms = ribbonPoints.map((point, index) =>
    bloom(
      point.x,
      point.y,
      randomBetween(prng, 0.12, 0.22),
      index % 2 === 0 ? 'accent' : 'light',
      randomBetween(prng, 0.11, 0.19),
    ),
  );

  return { blooms, ribbonPoints };
}

function buildBlooms(analysis: HueAnalysis, prng: Prng) {
  switch (analysis.visual.composition) {
    case 'horizon_wave':
      return { blooms: buildHorizonWave(analysis, prng) };
    case 'orbital_aura':
      return { blooms: buildOrbitalAura(analysis, prng) };
    case 'mist_field':
      return { blooms: buildMistField(analysis, prng) };
    case 'ember_field':
      return { blooms: buildEmberField(analysis, prng) };
    case 'liquid_ribbon':
      return buildLiquidRibbon(analysis, prng);
    case 'center_bloom':
    default:
      return { blooms: buildCenterBloom(analysis, prng) };
  }
}

function buildGrain(analysis: HueAnalysis, prng: Prng) {
  if (
    analysis.visual.texture !== 'soft_grain' &&
    analysis.visual.texture !== 'ink'
  ) {
    return undefined;
  }

  const isInk = analysis.visual.texture === 'ink';
  const count = isInk ? randomInt(prng, 60, 72) : randomInt(prng, 72, 90);

  return Array.from({ length: count }, () => ({
    opacity: randomBetween(prng, isInk ? 0.032 : 0.02, isInk ? 0.06 : 0.052),
    r: randomBetween(prng, 0.0018, isInk ? 0.0048 : 0.006),
    x: prng(),
    y: prng(),
  }));
}

export function derivePortraitGeometry(
  analysis: HueAnalysis,
  seedKey: string,
): PortraitGeometry {
  const safeAnalysis = normalizeHueAnalysis(analysis);
  const prng = createPrng(hashSeed(seedKey));
  const bloomGeometry = buildBlooms(safeAnalysis, prng);
  const ribbonPoints =
    'ribbonPoints' in bloomGeometry ? bloomGeometry.ribbonPoints : undefined;
  const grain = buildGrain(safeAnalysis, prng);

  return {
    blooms: bloomGeometry.blooms,
    gradientStops: buildGradientStops(safeAnalysis),
    grain,
    particles: buildParticles(safeAnalysis, prng),
    ribbonPoints,
  };
}
