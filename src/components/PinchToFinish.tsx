import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, spacing } from '@/src/theme';

type PinchToFinishProps = PropsWithChildren<{
  onFinish: () => void;
  reduceMotion?: boolean;
}>;

export function PinchToFinish({
  children,
  onFinish,
  reduceMotion = false,
}: PinchToFinishProps) {
  const [isComposing, setIsComposing] = useState(false);
  const scale = useSharedValue(1);
  const finishOpacity = useSharedValue(0);

  const enterComposeMode = useCallback(() => {
    setIsComposing(true);
  }, []);

  const exitComposeMode = useCallback(() => {
    setIsComposing(false);
  }, []);

  useEffect(() => {
    const nextScale = isComposing ? 0.92 : 1;
    const nextOpacity = isComposing ? 1 : 0;

    if (reduceMotion) {
      scale.value = nextScale;
      finishOpacity.value = nextOpacity;
      return;
    }

    scale.value = withSpring(nextScale, { damping: 18, stiffness: 190 });
    finishOpacity.value = withTiming(nextOpacity, { duration: 180 });
  }, [finishOpacity, isComposing, reduceMotion, scale]);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch().onEnd((event) => {
        if (event.scale < 0.85) {
          runOnJS(enterComposeMode)();
          return;
        }

        if (event.scale > 1.05) {
          runOnJS(exitComposeMode)();
        }
      }),
    [enterComposeMode, exitComposeMode],
  );
  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(isComposing)
        .onEnd(() => {
          runOnJS(exitComposeMode)();
        }),
    [exitComposeMode, isComposing],
  );
  const gesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, tapGesture),
    [pinchGesture, tapGesture],
  );

  const animatedCanvasStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedFinishStyle = useAnimatedStyle(() => ({
    opacity: finishOpacity.value,
  }));

  function handleFinish() {
    setIsComposing(false);
    onFinish();
  }

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.root}>
        <Animated.View style={animatedCanvasStyle}>{children}</Animated.View>
        {isComposing ? (
          <Animated.View style={[styles.finishWrap, animatedFinishStyle]}>
            <Pressable
              accessibilityLabel="Finish and save"
              accessibilityRole="button"
              onPress={handleFinish}
              style={({ pressed }) => [
                styles.finishButton,
                pressed && styles.pressed,
              ]}
            >
              <Feather color={colors.ink} name="check" size={24} />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  finishButton: {
    alignItems: 'center',
    backgroundColor: colors.amber,
    borderColor: colors.mist,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 54,
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    width: 54,
  },
  finishWrap: {
    bottom: spacing.md,
    position: 'absolute',
    right: spacing.md,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  root: {
    backgroundColor: colors.transparent,
    position: 'relative',
  },
});
