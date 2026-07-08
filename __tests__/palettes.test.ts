import { curatedPalettes } from '@/src/lib/palettes';
import { huePaletteColorSchema } from '@/src/lib/schemas';

describe('curatedPalettes', () => {
  it('contains twelve uniquely named palettes', () => {
    const ids = new Set(curatedPalettes.map((palette) => palette.id));
    const names = new Set(curatedPalettes.map((palette) => palette.name));

    expect(curatedPalettes).toHaveLength(12);
    expect(ids.size).toBe(curatedPalettes.length);
    expect(names.size).toBe(curatedPalettes.length);
  });

  it('uses valid Hue palette colors with normalized positive weights', () => {
    for (const palette of curatedPalettes) {
      expect(palette.colors).toHaveLength(4);

      const weightTotal = palette.colors.reduce(
        (total, color) => total + color.weight,
        0,
      );

      expect(weightTotal).toBeCloseTo(1, 5);

      for (const color of palette.colors) {
        expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
        expect(color.weight).toBeGreaterThan(0);
        expect(color.weight).toBeLessThanOrEqual(1);
        expect(huePaletteColorSchema.parse(color)).toEqual(color);
      }
    }
  });
});
