import { useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { RecorderUiState } from '@/src/hooks/useAudioRecorder';
import { colors, radius, spacing, typography } from '@/src/theme';

type MicOrbProps = {
  metering?: number;
  onPress?: () => void;
  reduceMotion?: boolean;
  state?: RecorderUiState;
};

export function MicOrb({
  metering = -60,
  onPress,
  reduceMotion,
  state = 'idle',
}: MicOrbProps) {
  const pulse = useSharedValue(0);
  const isRecording = state === 'recording';
  const label = isRecording ? 'Stop recording' : 'Start voice entry';

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = withTiming(0, { duration: 120 });
      return;
    }

    pulse.value = withRepeat(
      withTiming(1, { duration: isRecording ? 900 : 2600 }),
      -1,
      true,
    );
  }, [isRecording, pulse, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const audioLift = isRecording
      ? interpolate(Math.max(metering, -60), [-60, -10], [0, 0.08])
      : 0;
    const scale = interpolate(pulse.value, [0, 1], [1, 1.045 + audioLift]);

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.pressable}
    >
      <Animated.View style={[styles.glow, animatedStyle]}>
        <LinearGradient
          colors={[colors.rose, colors.amber, colors.lavender]}
          style={styles.orb}
        >
          <View style={styles.inner}>
            <Feather
              color={colors.mist}
              name={isRecording ? 'square' : 'mic'}
              size={26}
            />
            <Text style={styles.label}>
              {isRecording ? 'Listening' : 'Speak'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glow: {
    boxShadow: '0 0 28px rgba(167, 139, 250, 0.42)',
  },
  inner: {
    alignItems: 'center',
    backgroundColor: '#15111F99',
    borderRadius: radius.pill,
    height: 116,
    justifyContent: 'center',
    width: 116,
  },
  label: {
    color: colors.mist,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.small,
  },
  orb: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 132,
    justifyContent: 'center',
    padding: spacing.xs,
    width: 132,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
});
