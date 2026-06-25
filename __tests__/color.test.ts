import {
  applyHueAdjustment,
  fallbackHueAnalysis,
  normalizePalette,
} from '@/src/utils/color';

describe('color utilities', () => {
  it('falls back when palette colors are invalid', () => {
    const palette = normalizePalette([
      { hex: 'nope', role: 'base', weight: 2, meaning: 'bad color' },
    ]);

    expect(palette[0].hex).toBe('#111018');
  });

  it('keeps stillness controls inside valid visual ranges', () => {
    const analysis = fallbackHueAnalysis({
      visual: {
        composition: 'center_bloom',
        motion: 'soft_pulse',
        texture: 'soft_grain',
        brightness: 0.5,
        warmth: 0.5,
        edgeSoftness: 0.5,
        particleDensity: 0.05,
        animationSpeed: 0.05,
      },
    });
    const adjusted = applyHueAdjustment(analysis, 'more_still');

    expect(adjusted.visual.motion).toBe('still');
    expect(adjusted.visual.particleDensity).toBeGreaterThanOrEqual(0);
    expect(adjusted.visual.animationSpeed).toBeGreaterThanOrEqual(0);
  });
});
