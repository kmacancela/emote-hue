import { useEffect, useMemo } from 'react';
import type {
  ColorValue,
  DimensionValue,
  StyleProp,
  ViewStyle,
} from 'react-native';
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
import { derivePortraitGeometry } from '@/src/lib/portraitGeometry';
import { normalizeHueAnalysis, withAlpha } from '@/src/utils/color';

type HueCanvasProps = {
  analysis: HueAnalysis;
  interactive?: boolean;
  preview?: boolean;
  reduceMotion?: boolean;
  seedKey?: string;
  style?: StyleProp<ViewStyle>;
};

type WebViewStyle = ViewStyle & { backgroundImage?: string };

function percent(value: number): DimensionValue {
  return `${value * 100}%` as DimensionValue;
}

function gradientColorsTuple(
  gradientColors: ColorValue[],
): readonly [ColorValue, ColorValue, ...ColorValue[]] {
  const first = gradientColors[0] ?? colors.ink;
  const second = gradientColors[1] ?? first;

  return [first, second, ...gradientColors.slice(2)];
}

function gradientLocationsTuple(
  gradientLocations: number[],
): readonly [number, number, ...number[]] {
  const first = gradientLocations[0] ?? 0;
  const second = gradientLocations[1] ?? 1;

  return [first, second, ...gradientLocations.slice(2)];
}

function radialGradient(
  color: string,
  light: string,
  base: string,
  opacity: number,
) {
  return `radial-gradient(circle, ${withAlpha(color, opacity)} 0%, ${withAlpha(
    light,
    opacity * 0.3,
  )} 44%, ${withAlpha(base, 0)} 72%)`;
}

export function HueCanvas({
  analysis,
  interactive = true,
  preview = false,
  reduceMotion = false,
  seedKey = 'sample',
  style,
}: HueCanvasProps) {
  const safeAnalysis = useMemo(
    () => normalizeHueAnalysis(analysis),
    [analysis],
  );
  const geometry = useMemo(
    () => derivePortraitGeometry(safeAnalysis, seedKey),
    [safeAnalysis, seedKey],
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
  const roleColors = {
    accent,
    base,
    light,
    neutral,
    shadow,
  };
  const particleColors = { accent, light };
  const gradientColors = gradientColorsTuple(
    geometry.gradientStops.map((stop) => stop.color),
  );
  const gradientLocations = gradientLocationsTuple(
    geometry.gradientStops.map((stop) => stop.position),
  );
  const particleLimit = preview ? 6 : geometry.particles.length;
  const particles = geometry.particles.slice(0, particleLimit);
  const grain = preview ? [] : (geometry.grain ?? []);
  const blur = 18 + safeAnalysis.visual.edgeSoftness * 22;

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
        colors={gradientColors}
        end={{ x: 1, y: 1 }}
        locations={gradientLocations}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {geometry.ribbonPoints?.map((point, index) => {
        const beadRadius = 0.06;
        const ribbonStyle: WebViewStyle = {
          backgroundImage: radialGradient(accent, light, base, 0.14),
          filter: `blur(${Math.round(blur * 0.8)}px)`,
          height: percent(beadRadius * 2),
          left: percent(point.x - beadRadius),
          top: percent(point.y - beadRadius),
          width: percent(beadRadius * 2),
        };

        return (
          <View
            key={`ribbon-${index}`}
            style={[styles.ribbonBead, ribbonStyle]}
          />
        );
      })}

      {geometry.blooms.map((bloom, index) => {
        const bloomStyle: WebViewStyle = {
          backgroundColor: withAlpha(roleColors[bloom.role], bloom.opacity),
          backgroundImage: radialGradient(
            roleColors[bloom.role],
            light,
            base,
            bloom.opacity,
          ),
          filter: `blur(${Math.round(blur)}px)`,
          height: percent(bloom.r * 2),
          left: percent(bloom.cx - bloom.r),
          top: percent(bloom.cy - bloom.r),
          width: percent(bloom.r * 2),
        };

        return (
          <View key={`bloom-${index}`} style={[styles.bloom, bloomStyle]} />
        );
      })}

      {particles.map((particle, index) => {
        const particleStyle: ViewStyle = {
          backgroundColor: withAlpha(
            particleColors[particle.colorRole],
            particle.opacity,
          ),
          height: percent(particle.r * 2),
          left: percent(particle.x - particle.r),
          top: percent(particle.y - particle.r),
          width: percent(particle.r * 2),
        };

        return (
          <View
            key={`particle-${index}`}
            style={[styles.particle, particleStyle]}
          />
        );
      })}

      {grain.map((speckle, index) => {
        const speckleStyle: ViewStyle = {
          backgroundColor: withAlpha(
            safeAnalysis.visual.texture === 'ink' ? shadow : light,
            speckle.opacity,
          ),
          height: percent(speckle.r * 2),
          left: percent(speckle.x - speckle.r),
          top: percent(speckle.y - speckle.r),
          width: percent(speckle.r * 2),
        };

        return (
          <View key={`grain-${index}`} style={[styles.grain, speckleStyle]} />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bloom: {
    borderRadius: radius.pill,
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
  grain: {
    borderRadius: radius.pill,
    position: 'absolute',
  },
  ribbonBead: {
    borderRadius: radius.pill,
    opacity: 0.82,
    position: 'absolute',
  },
});
