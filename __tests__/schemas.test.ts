import { sampleHueAnalysis } from '@/src/lib/mockHue';
import { hueAnalysisSchema } from '@/src/lib/schemas';

describe('hueAnalysisSchema', () => {
  it('accepts the bundled sample hue analysis', () => {
    expect(hueAnalysisSchema.parse(sampleHueAnalysis)).toEqual(
      sampleHueAnalysis,
    );
  });

  it('rejects invalid palette colors', () => {
    const invalid = {
      ...sampleHueAnalysis,
      palette: [{ ...sampleHueAnalysis.palette[0], hex: 'violet' }],
    };

    expect(hueAnalysisSchema.safeParse(invalid).success).toBe(false);
  });
});
