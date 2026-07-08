import { applyIntensity, createMockHueAnalysis } from '@/src/lib/mockHue';

describe('applyIntensity', () => {
  it('recomputes intensity-derived visual fields while preserving language fields', () => {
    const analysis = createMockHueAnalysis(
      'I feel hopeful and ready, but stretched.',
      5,
    );

    const quiet = applyIntensity(analysis, 2);
    const strong = applyIntensity(analysis, 9);

    expect(strong.intensity).toBe(9);
    expect(strong.arousal).toBe(0.9);
    expect(strong.visual.motion).toBe('bloom');
    expect(strong.visual.brightness).toBeCloseTo(0.805);
    expect(strong.visual.particleDensity).toBeCloseTo(0.615);
    expect(strong.visual.animationSpeed).toBeCloseTo(0.68);

    expect(quiet.visual.motion).toBe('still');
    expect(quiet.visual.brightness).not.toBe(strong.visual.brightness);
    expect(quiet.visual.particleDensity).not.toBe(
      strong.visual.particleDensity,
    );
    expect(quiet.visual.animationSpeed).not.toBe(strong.visual.animationSpeed);

    expect(strong.palette).toEqual(analysis.palette);
    expect(strong.primaryEmotion).toBe(analysis.primaryEmotion);
    expect(strong.emotionWords).toEqual(analysis.emotionWords);
    expect(strong.visual.composition).toBe(analysis.visual.composition);
    expect(strong.visual.texture).toBe(analysis.visual.texture);
  });

  it('clamps out-of-range intensity values', () => {
    const analysis = createMockHueAnalysis('A quiet reflection.', 5);

    const minimum = applyIntensity(analysis, -10);
    const maximum = applyIntensity(analysis, 24);

    expect(minimum.intensity).toBe(1);
    expect(minimum.arousal).toBe(0.1);
    expect(minimum.visual.motion).toBe('still');
    expect(minimum.visual.brightness).toBeGreaterThanOrEqual(0);

    expect(maximum.intensity).toBe(10);
    expect(maximum.arousal).toBe(1);
    expect(maximum.visual.motion).toBe('bloom');
    expect(maximum.visual.brightness).toBeLessThanOrEqual(1);
    expect(maximum.visual.particleDensity).toBeLessThanOrEqual(1);
    expect(maximum.visual.animationSpeed).toBeLessThanOrEqual(1);
  });
});
