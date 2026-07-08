import { derivePortraitGeometry } from '@/src/lib/portraitGeometry';
import type { HueAnalysis, HueComposition } from '@/src/types/hue';
import { fallbackHueAnalysis } from '@/src/utils/color';

const basePalette = [
  { hex: '#101020', role: 'base' as const, weight: 0.5, meaning: 'base' },
  { hex: '#202040', role: 'shadow' as const, weight: 0.2, meaning: 'shadow' },
  { hex: '#F0A050', role: 'accent' as const, weight: 0.1, meaning: 'accent' },
  { hex: '#F6F1FF', role: 'light' as const, weight: 0.2, meaning: 'light' },
];

function analysisFor(composition: HueComposition): HueAnalysis {
  return fallbackHueAnalysis({
    intensity: 6,
    palette: basePalette,
    visual: {
      animationSpeed: 0.34,
      brightness: 0.58,
      composition,
      edgeSoftness: 0.62,
      motion: 'soft_pulse',
      particleDensity: 0.42,
      texture: 'soft_grain',
      warmth: 0.52,
    },
  });
}

function range(values: number[]) {
  return Math.max(...values) - Math.min(...values);
}

function bloomSignature(analysis: HueAnalysis) {
  const geometry = derivePortraitGeometry(analysis, 'signature-seed');
  const xSpread = range(geometry.blooms.map((bloom) => bloom.cx));
  const ySpread = range(geometry.blooms.map((bloom) => bloom.cy));
  const averageRadius =
    geometry.blooms.reduce((total, bloom) => total + bloom.r, 0) /
    geometry.blooms.length;

  return [
    geometry.blooms.length,
    xSpread.toFixed(2),
    ySpread.toFixed(2),
    averageRadius.toFixed(2),
    geometry.ribbonPoints ? 'ribbon' : 'field',
  ].join(':');
}

describe('derivePortraitGeometry', () => {
  it('is deterministic per seed key', () => {
    const analysis = analysisFor('center_bloom');

    expect(derivePortraitGeometry(analysis, 'same-entry')).toEqual(
      derivePortraitGeometry(analysis, 'same-entry'),
    );
  });

  it('changes particle positions for different seed keys', () => {
    const analysis = analysisFor('center_bloom');
    const first = derivePortraitGeometry(analysis, 'entry-one').particles.map(
      ({ x, y }) => ({ x, y }),
    );
    const second = derivePortraitGeometry(analysis, 'entry-two').particles.map(
      ({ x, y }) => ({ x, y }),
    );

    expect(first).not.toEqual(second);
  });

  it('gives every composition a distinct bloom structure', () => {
    const compositions: HueComposition[] = [
      'center_bloom',
      'horizon_wave',
      'orbital_aura',
      'mist_field',
      'ember_field',
      'liquid_ribbon',
    ];
    const signatures = compositions.map((composition) =>
      bloomSignature(analysisFor(composition)),
    );

    expect(new Set(signatures).size).toBe(compositions.length);
  });

  it('orders gradient stops by palette role and reflects weights', () => {
    const stops = derivePortraitGeometry(
      analysisFor('center_bloom'),
      'weights',
    ).gradientStops;

    expect(stops.map((stop) => stop.color)).toEqual([
      '#101020',
      '#202040',
      '#F0A050',
      '#F6F1FF',
    ]);
    expect(stops.map((stop) => stop.position)).toEqual([0, 0.5, 0.7, 1]);
  });

  it('keeps coordinates, radii, and opacities in valid ranges', () => {
    const compositions: HueComposition[] = [
      'center_bloom',
      'horizon_wave',
      'orbital_aura',
      'mist_field',
      'ember_field',
      'liquid_ribbon',
    ];

    for (const composition of compositions) {
      const geometry = derivePortraitGeometry(
        analysisFor(composition),
        `bounds-${composition}`,
      );

      for (const particle of geometry.particles) {
        expect(particle.x).toBeGreaterThanOrEqual(0);
        expect(particle.x).toBeLessThanOrEqual(1);
        expect(particle.y).toBeGreaterThanOrEqual(0);
        expect(particle.y).toBeLessThanOrEqual(1);
        expect(particle.r).toBeGreaterThan(0);
        expect(particle.r).toBeLessThanOrEqual(1);
        expect(particle.opacity).toBeGreaterThanOrEqual(0);
        expect(particle.opacity).toBeLessThanOrEqual(1);
      }

      for (const bloom of geometry.blooms) {
        expect(bloom.cx).toBeGreaterThanOrEqual(0);
        expect(bloom.cx).toBeLessThanOrEqual(1);
        expect(bloom.cy).toBeGreaterThanOrEqual(0);
        expect(bloom.cy).toBeLessThanOrEqual(1);
        expect(bloom.r).toBeGreaterThan(0);
        expect(bloom.r).toBeLessThanOrEqual(1);
        expect(bloom.opacity).toBeGreaterThanOrEqual(0);
        expect(bloom.opacity).toBeLessThanOrEqual(1);
      }

      for (const point of geometry.ribbonPoints ?? []) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(1);
      }

      for (const grain of geometry.grain ?? []) {
        expect(grain.x).toBeGreaterThanOrEqual(0);
        expect(grain.x).toBeLessThanOrEqual(1);
        expect(grain.y).toBeGreaterThanOrEqual(0);
        expect(grain.y).toBeLessThanOrEqual(1);
        expect(grain.r).toBeGreaterThan(0);
        expect(grain.r).toBeLessThanOrEqual(1);
        expect(grain.opacity).toBeGreaterThanOrEqual(0);
        expect(grain.opacity).toBeLessThanOrEqual(1);
      }
    }
  });
});
