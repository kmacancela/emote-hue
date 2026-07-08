import { createPrng, hashSeed } from '@/src/lib/prng';

describe('seeded PRNG', () => {
  it('returns deterministic sequences for the same seed', () => {
    const seed = hashSeed('entry-123');
    const first = createPrng(seed);
    const second = createPrng(seed);

    expect(Array.from({ length: 8 }, () => first())).toEqual(
      Array.from({ length: 8 }, () => second()),
    );
  });

  it('returns different sequences for different seeds', () => {
    const first = createPrng(hashSeed('entry-123'));
    const second = createPrng(hashSeed('entry-456'));

    expect(Array.from({ length: 8 }, () => first())).not.toEqual(
      Array.from({ length: 8 }, () => second()),
    );
  });

  it('keeps output inside [0, 1)', () => {
    const prng = createPrng(hashSeed('bounds'));

    for (let index = 0; index < 100; index += 1) {
      const value = prng();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
