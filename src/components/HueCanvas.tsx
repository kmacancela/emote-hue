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
  Path,
  LinearGradient as SkiaLinearGradient,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';

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

function buildRibbonPath(
  points: { x: number; y: number }[] | undefined,
  width: number,
  height: number,
) {
  if (!points || points.length < 2) {
    return undefined;
  }

  const scaled = points.map((point) => ({
    x: point.x * width,
    y: point.y * height,
  }));
  const [firstPoint] = scaled;
  const commands = [`M ${firstPoint.x} ${firstPoint.y}`];

  for (let index = 1; index < scaled.length - 1; index += 1) {
    const point = scaled[index];
    const nextPoint = scaled[index + 1];
    const midPoint = {
      x: (point.x + nextPoint.x) / 2,
      y: (point.y + nextPoint.y) / 2,
    };

    commands.push(`Q ${point.x} ${point.y} ${midPoint.x} ${midPoint.y}`);
  }

  const lastPoint = scaled[scaled.length - 1];
  commands.push(`L ${lastPoint.x} ${lastPoint.y}`);

  return commands.join(' ');
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
  const particleColors = { accent, light };
  const roleColors = {
    accent,
    base,
    light,
    neutral,
    shadow,
  };
  const gradientColors = geometry.gradientStops.map((stop) => stop.color);
  const gradientPositions = geometry.gradientStops.map((stop) => stop.position);
  const particleLimit = preview ? 6 : geometry.particles.length;
  const particles = geometry.particles.slice(0, particleLimit);
  const grain = preview ? [] : (geometry.grain ?? []);
  const canvasMin = Math.min(size.width, size.height);
  const canvasMax = Math.max(size.width, size.height);
  const blur = safeAnalysis.visual.edgeSoftness * 18 + 4;
  const ribbonPath = buildRibbonPath(
    geometry.ribbonPoints,
    size.width,
    size.height,
  );
  const ribbonStrokeWidth =
    canvasMax * (safeAnalysis.visual.texture === 'watercolor' ? 0.088 : 0.072);

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
            colors={gradientColors}
            end={vec(size.width, size.height)}
            positions={gradientPositions}
            start={vec(0, 0)}
          />
        </Rect>

        {ribbonPath ? (
          <Path
            color={withAlpha(accent, 0.16)}
            path={ribbonPath}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            strokeWidth={ribbonStrokeWidth}
          >
            <Blur blur={blur * 1.25} />
          </Path>
        ) : null}

        {geometry.blooms.map((bloom, index) => {
          const cx = size.width * bloom.cx;
          const cy = size.height * bloom.cy;
          const bloomRadius = canvasMax * bloom.r;
          const bloomColor = roleColors[bloom.role];

          return (
            <Group key={`bloom-${index}`} opacity={0.9}>
              <Circle cx={cx} cy={cy} r={bloomRadius}>
                <RadialGradient
                  c={vec(cx, cy)}
                  colors={[
                    withAlpha(bloomColor, bloom.opacity),
                    withAlpha(light, bloom.opacity * 0.28),
                    withAlpha(base, 0),
                  ]}
                  r={bloomRadius}
                />
                <Blur blur={blur} />
              </Circle>
            </Group>
          );
        })}

        {particles.map((particle, index) => (
          <Circle
            color={withAlpha(
              particleColors[particle.colorRole],
              particle.opacity,
            )}
            cx={size.width * particle.x}
            cy={size.height * particle.y}
            key={`particle-${index}`}
            r={canvasMin * particle.r}
          />
        ))}

        {grain.map((speckle, index) => (
          <Circle
            color={withAlpha(
              safeAnalysis.visual.texture === 'ink' ? shadow : light,
              speckle.opacity,
            )}
            cx={size.width * speckle.x}
            cy={size.height * speckle.y}
            key={`grain-${index}`}
            r={Math.max(0.55, canvasMin * speckle.r)}
          />
        ))}
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
