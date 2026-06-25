import { useEffect, useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  LinearGradient as SkiaLinearGradient,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';

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
  const [size, setSize] = useState({ width: 1, height: 1 });
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
  const glowRadius =
    Math.max(size.width, size.height) *
    (0.34 + safeAnalysis.visual.brightness * 0.18);
  const centerY =
    safeAnalysis.visual.composition === 'horizon_wave'
      ? size.height * 0.62
      : size.height * 0.5;

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
      onLayout={(event) => {
        const { height, width } = event.nativeEvent.layout;
        setSize({ height: Math.max(height, 1), width: Math.max(width, 1) });
      }}
      style={[
        styles.frame,
        preview && styles.previewFrame,
        animatedStyle,
        style,
      ]}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect height={size.height} width={size.width} x={0} y={0}>
          <SkiaLinearGradient
            colors={[base, shadow, withAlpha(accent, 0.42)]}
            end={vec(size.width, size.height)}
            start={vec(0, 0)}
          />
        </Rect>

        <Group opacity={0.88}>
          <Circle cx={size.width * 0.5} cy={centerY} r={glowRadius}>
            <RadialGradient
              c={vec(size.width * 0.5, centerY)}
              colors={[
                withAlpha(accent, 0.9),
                withAlpha(light, 0.32),
                withAlpha(base, 0),
              ]}
              r={glowRadius}
            />
            <Blur blur={safeAnalysis.visual.edgeSoftness * 18 + 4} />
          </Circle>
        </Group>

        <Group opacity={0.56}>
          <Circle
            cx={size.width * (safeAnalysis.visual.warmth > 0.55 ? 0.68 : 0.32)}
            cy={size.height * 0.35}
            r={size.width * 0.26}
          >
            <RadialGradient
              c={vec(
                size.width * (safeAnalysis.visual.warmth > 0.55 ? 0.68 : 0.32),
                size.height * 0.35,
              )}
              colors={[
                withAlpha(light, 0.78),
                withAlpha(neutral, 0.22),
                withAlpha(base, 0),
              ]}
              r={size.width * 0.26}
            />
            <Blur blur={12} />
          </Circle>
        </Group>

        {Array.from({ length: preview ? 5 : 12 }).map((_, index) => {
          const x = ((index * 73) % 100) / 100;
          const y = ((index * 41) % 100) / 100;
          const radiusValue =
            1.8 + safeAnalysis.visual.particleDensity * 4 + (index % 3);

          return (
            <Circle
              color={withAlpha(index % 2 === 0 ? light : accent, 0.22)}
              cx={size.width * x}
              cy={size.height * y}
              key={index}
              r={radiusValue}
            />
          );
        })}
      </Canvas>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 1,
    backgroundColor: colors.inkRaised,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
  },
  previewFrame: {
    borderRadius: radius.md,
  },
});
