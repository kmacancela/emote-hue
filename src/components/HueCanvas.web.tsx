import { useEffect, useMemo } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { HueAnalysis } from '@/src/types/hue';
import { colors, radius } from '@/src/theme';
import { normalizeHueAnalysis, withAlpha } from '@/src/utils/color';

type HueCanvasProps = {
  analysis: HueAnalysis;
  interactive?: boolean;
  preview?: boolean;
  reduceMotion?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function HueCanvas({
  analysis,
  interactive = true,
  preview = false,
  reduceMotion = false,
  style,
}: HueCanvasProps) {
  const safeAnalysis = useMemo(
    () => normalizeHueAnalysis(analysis),
    [analysis],
  );
  const progress = useSharedValue(0);
  const palette = safeAnalysis.palette;
  const base =
    palette.find((color) => color.role === 'base')?.hex ??
    palette[0]?.hex ??
    colors.ink;
  const shadow =
    palette.find((color) => color.role === 'shadow')?.hex ?? colors.violetDepth;
  const accent =
    palette.find((color) => color.role === 'accent')?.hex ?? colors.lavender;
  const light =
    palette.find((color) => color.role === 'light')?.hex ?? colors.mist;
  const neutral =
    palette.find((color) => color.role === 'neutral')?.hex ?? colors.sage;
  const speed = 6200 - safeAnalysis.visual.animationSpeed * 3300;

  useEffect(() => {
    if (
      !interactive ||
      reduceMotion ||
      safeAnalysis.visual.motion === 'still'
    ) {
      progress.value = withTiming(0, { duration: 180 });
      return;
    }

    progress.value = withRepeat(withTiming(1, { duration: speed }), -1, true);
  }, [interactive, progress, reduceMotion, safeAnalysis.visual.motion, speed]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 1.025]);
    const rotate = interpolate(progress.value, [0, 1], [-1.4, 1.4]);

    return {
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.frame,
        preview && styles.previewFrame,
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={[base, shadow, withAlpha(accent, 0.42)]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.bloom,
          {
            backgroundColor: withAlpha(accent, 0.72),
            height: `${72 + safeAnalysis.visual.brightness * 18}%`,
            left: '14%',
            top:
              safeAnalysis.visual.composition === 'horizon_wave'
                ? '34%'
                : '14%',
            width: `${72 + safeAnalysis.visual.brightness * 18}%`,
          },
        ]}
      />
      <View
        style={[
          styles.smallGlow,
          {
            backgroundColor: withAlpha(
              safeAnalysis.visual.warmth > 0.55 ? light : neutral,
              0.5,
            ),
            left: safeAnalysis.visual.warmth > 0.55 ? '54%' : '10%',
            top: '18%',
          },
        ]}
      />
      {Array.from({ length: preview ? 5 : 12 }).map((_, index) => {
        const left = `${(index * 73) % 100}%` as DimensionValue;
        const top = `${(index * 41) % 100}%` as DimensionValue;
        const dotSize =
          3 + safeAnalysis.visual.particleDensity * 6 + (index % 3);
        const particleStyle: ViewStyle = {
          backgroundColor: withAlpha(index % 2 === 0 ? light : accent, 0.28),
          height: dotSize,
          left,
          top,
          width: dotSize,
        };

        return <View key={index} style={[styles.particle, particleStyle]} />;
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bloom: {
    borderRadius: radius.pill,
    filter: 'blur(28px)',
    opacity: 0.72,
    position: 'absolute',
  },
  frame: {
    aspectRatio: 1,
    backgroundColor: colors.inkRaised,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
  },
  particle: {
    borderRadius: radius.pill,
    position: 'absolute',
  },
  previewFrame: {
    borderRadius: radius.md,
  },
  smallGlow: {
    borderRadius: radius.pill,
    filter: 'blur(16px)',
    height: '38%',
    opacity: 0.58,
    position: 'absolute',
    width: '38%',
  },
});
