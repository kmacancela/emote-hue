import { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { HueCanvas } from '@/src/components/HueCanvas';
import type { ShareCardPayload } from '@/src/lib/privacy';
import { colors, radius, spacing, typography } from '@/src/theme';
import { fallbackHueAnalysis } from '@/src/utils/color';

export type ShareCardEntry = ShareCardPayload;

export type ShareCardFormat = 'square' | 'story';

export type ShareCardProps = {
  entry: ShareCardEntry;
  format: ShareCardFormat;
  reduceMotion?: boolean;
};

const CARD_WIDTH = 360;
const STORY_HEIGHT = 640;

export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { entry, format, reduceMotion = true },
  ref,
) {
  const analysis = useMemo(
    () =>
      fallbackHueAnalysis({
        arousal: Math.min(Math.max(entry.intensity / 10, 0), 1),
        emotionWords: entry.emotionWords,
        intensity: entry.intensity,
        palette: entry.palette,
        primaryEmotion: entry.primaryEmotion,
        secondaryEmotions: entry.emotionWords.slice(0, 3),
        visual: entry.visual,
      }),
    [entry],
  );
  const emotionWords = entry.emotionWords.slice(0, 3);
  const isStory = format === 'story';

  return (
    <View
      accessibilityElementsHidden
      collapsable={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      ref={ref}
      style={[styles.card, isStory ? styles.story : styles.square]}
    >
      <HueCanvas
        analysis={analysis}
        interactive={false}
        reduceMotion={reduceMotion}
        seedKey={entry.id}
        style={isStory ? styles.storyArt : styles.squareArt}
      />

      <View
        style={[
          styles.ambientShade,
          isStory ? styles.storyShade : styles.squareShade,
        ]}
      />

      {emotionWords.length > 0 ? (
        <View style={[styles.chips, isStory && styles.storyChips]}>
          {emotionWords.map((word) => (
            <View key={word} style={styles.chip}>
              <BrandText numberOfLines={1} style={styles.chipLabel}>
                {word}
              </BrandText>
            </View>
          ))}
        </View>
      ) : null}

      <BrandText muted style={styles.wordmark} variant="small">
        Emote Hue
      </BrandText>

      <View style={styles.paletteStrip}>
        {entry.palette.map((color) => (
          <View
            key={`${entry.id}-${color.hex}-${color.role}`}
            style={[
              styles.paletteSwatch,
              {
                backgroundColor: color.hex,
                flex: Math.max(color.weight, 0.08),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  ambientShade: {
    backgroundColor: 'rgba(17, 16, 24, 0.18)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  card: {
    backgroundColor: colors.ink,
    overflow: 'hidden',
    width: CARD_WIDTH,
  },
  chip: {
    backgroundColor: 'rgba(228, 224, 242, 0.12)',
    borderColor: 'rgba(228, 224, 242, 0.28)',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 132,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  chipLabel: {
    color: colors.mist,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.caption,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
  },
  paletteStrip: {
    bottom: 0,
    flexDirection: 'row',
    height: 10,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  paletteSwatch: {
    height: '100%',
  },
  square: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  squareArt: {
    borderColor: 'rgba(228, 224, 242, 0.14)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  squareShade: {
    height: 112,
  },
  story: {
    height: STORY_HEIGHT,
  },
  storyArt: {
    aspectRatio: 9 / 16,
    borderRadius: 0,
    borderWidth: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  storyChips: {
    top: spacing.xl,
  },
  storyShade: {
    height: 180,
  },
  wordmark: {
    bottom: spacing.lg,
    fontWeight: typography.weight.semibold,
    left: spacing.lg,
    letterSpacing: 0.6,
    position: 'absolute',
  },
});
