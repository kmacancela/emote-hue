import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  calibrationCards,
  useColorCalibration,
} from '@/src/hooks/useColorCalibration';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { gentleSelection } from '@/src/lib/haptics';
import { colors, motion, radius, spacing, typography } from '@/src/theme';

const floatingWordPositions = [
  { left: '1%', top: '7%' },
  { right: '2%', top: '17%' },
  { left: '18%', top: '32%' },
  { right: '10%', top: '47%' },
  { left: '5%', top: '64%' },
  { right: '25%', top: '79%' },
] as const;

const floatingWordTextStyles = [
  { fontSize: 34, lineHeight: 40 },
  { fontSize: 24, lineHeight: 30 },
  { fontSize: 30, lineHeight: 36 },
  { fontSize: 23, lineHeight: 29 },
  { fontSize: 28, lineHeight: 34 },
  { fontSize: 22, lineHeight: 28 },
] as const;

const wordMotionSeeds = [
  { duration: 6200, x: 10, y: 16 },
  { duration: 7600, x: -12, y: 12 },
  { duration: 6900, x: 14, y: -10 },
  { duration: 8100, x: -10, y: -14 },
  { duration: 7300, x: 12, y: 10 },
  { duration: 8700, x: -8, y: 16 },
] as const;

const visibleWordCount = 6;

function isLightColor(hex: string) {
  const color = hex.replace('#', '');
  const red = Number.parseInt(color.slice(0, 2), 16);
  const green = Number.parseInt(color.slice(2, 4), 16);
  const blue = Number.parseInt(color.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.58;
}

function createVisibleWords(
  words: readonly string[],
  refreshCount: number,
  selectedWord?: string,
) {
  if (refreshCount === 0) {
    return words.slice(0, visibleWordCount);
  }

  const shuffledWords = words
    .filter((word) => word !== selectedWord)
    .map((word, index) => ({
      index,
      score: (index * 7 + refreshCount * 5) % words.length,
      word,
    }))
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .slice(0, selectedWord ? visibleWordCount - 1 : visibleWordCount)
    .map((item) => item.word);

  return selectedWord ? [selectedWord, ...shuffledWords] : shuffledWords;
}

export default function CalibrationScreen() {
  const router = useRouter();
  const { saveCalibrations } = useColorCalibration();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLabels, setSelectedLabels] = useState<
    Record<string, string[]>
  >({});
  const [wordRefreshCounts, setWordRefreshCounts] = useState<
    Record<string, number>
  >({});
  const [cardMotion] = useState(() => new Animated.Value(1));
  const [wordMotionValues] = useState(() =>
    floatingWordPositions.map(() => new Animated.Value(0)),
  );
  const activeCard = calibrationCards[activeIndex];
  const activeHex = activeCard.hex;
  const isLight = isLightColor(activeHex);
  const activeLabels = selectedLabels[activeHex] ?? [];
  const selectedLabel = activeLabels[0];
  const visibleWords = useMemo(
    () =>
      createVisibleWords(
        activeCard.words,
        wordRefreshCounts[activeHex] ?? 0,
        selectedLabel,
      ),
    [activeCard.words, activeHex, selectedLabel, wordRefreshCounts],
  );
  const isLastColor = activeIndex === calibrationCards.length - 1;
  const textColor = isLight ? colors.ink : colors.mist;
  const lineColor = isLight
    ? 'rgba(17, 16, 24, 0.22)'
    : 'rgba(255, 255, 255, 0.24)';
  const softSurface = isLight
    ? 'rgba(255, 255, 255, 0.26)'
    : 'rgba(17, 16, 24, 0.24)';
  const selectedSurface = isLight ? colors.ink : colors.mist;
  const selectedText = isLight ? colors.mist : colors.ink;
  const hasSelection = useMemo(
    () => Object.values(selectedLabels).some((labels) => labels.length > 0),
    [selectedLabels],
  );

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    cardMotion.setValue(0);
    Animated.timing(cardMotion, {
      duration: motion.base,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, cardMotion, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      wordMotionValues.forEach((value) => value.setValue(0));
      return;
    }

    const loops = wordMotionValues.map((value, index) => {
      const seed = wordMotionSeeds[index];
      value.setValue(index % 2 === 0 ? 0 : 0.5);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            duration: seed.duration,
            easing: Easing.inOut(Easing.sin),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            duration: seed.duration + 600,
            easing: Easing.inOut(Easing.sin),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      );

      loop.start();
      return loop;
    });

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [reduceMotion, wordMotionValues]);

  function moveToCard(nextIndex: number) {
    const wrappedIndex =
      (nextIndex + calibrationCards.length) % calibrationCards.length;
    setActiveIndex(wrappedIndex);
    void gentleSelection();
  }

  function toggleLabel(label: string) {
    setSelectedLabels((current) => {
      const labels = current[activeHex] ?? [];
      const nextLabels = labels.includes(label) ? [] : [label];

      return {
        ...current,
        [activeHex]: nextLabels,
      };
    });
    void gentleSelection();
  }

  function showMoreWords() {
    setWordRefreshCounts((current) => ({
      ...current,
      [activeHex]: (current[activeHex] ?? 0) + 1,
    }));
    void gentleSelection();
  }

  async function continueToPrivacy() {
    await saveCalibrations(selectedLabels);
    router.push('/onboarding/privacy');
  }

  return (
    <Animated.View style={[styles.root, { backgroundColor: activeHex }]}>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.progressRow}>
            {calibrationCards.map((card, index) => {
              const isActive = activeIndex === index;
              const isNamed = (selectedLabels[card.hex] ?? []).length > 0;

              return (
                <Pressable
                  accessibilityLabel={`Show ${card.name}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  key={card.hex}
                  onPress={() => moveToCard(index)}
                  style={[
                    styles.progressDot,
                    { backgroundColor: lineColor },
                    isActive && {
                      backgroundColor: textColor,
                      opacity: 1,
                      width: 32,
                    },
                    isNamed && {
                      backgroundColor: selectedSurface,
                      opacity: 1,
                    },
                  ]}
                />
              );
            })}
          </View>

          <Animated.View
            style={[
              styles.wordField,
              !reduceMotion && {
                opacity: cardMotion,
                transform: [
                  {
                    translateY: cardMotion.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {visibleWords.map((label, index) => {
              const isSelected = selectedLabel === label;
              const motionValue = wordMotionValues[index];
              const seed = wordMotionSeeds[index];

              return (
                <Animated.View
                  accessibilityState={{ selected: isSelected }}
                  key={label}
                  style={[
                    styles.floatingWordShell,
                    floatingWordPositions[index],
                    !reduceMotion && {
                      transform: [
                        {
                          translateX: motionValue.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [-seed.x, seed.x, -seed.x],
                          }),
                        },
                        {
                          translateY: motionValue.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [seed.y, -seed.y, seed.y],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Pressable
                    accessibilityLabel={`${label}, ${activeCard.name}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => toggleLabel(label)}
                    style={[
                      styles.floatingWord,
                      {
                        backgroundColor: isSelected
                          ? selectedSurface
                          : colors.transparent,
                        borderColor: isSelected
                          ? selectedSurface
                          : colors.transparent,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.floatingLabel,
                        floatingWordTextStyles[index],
                        {
                          color: isSelected ? selectedText : textColor,
                          textShadowColor: isLight
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(17, 16, 24, 0.28)',
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>

          <View style={styles.footer}>
            <View style={styles.colorControls}>
              <IconButton
                accessibilityLabel="Previous color"
                icon="chevron-left"
                onPress={() => moveToCard(activeIndex - 1)}
                surfaceColor={softSurface}
                textColor={textColor}
              />
              <IconButton
                accessibilityLabel="Show more words"
                icon="refresh-cw"
                onPress={showMoreWords}
                surfaceColor={softSurface}
                textColor={textColor}
              />
              {isLastColor ? (
                <DoneButton
                  disabled={!hasSelection}
                  onPress={continueToPrivacy}
                  surfaceColor={selectedSurface}
                  textColor={selectedText}
                />
              ) : (
                <IconButton
                  accessibilityLabel="Next color"
                  icon="chevron-right"
                  onPress={() => moveToCard(activeIndex + 1)}
                  surfaceColor={softSurface}
                  textColor={textColor}
                />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

type DoneButtonProps = {
  disabled?: boolean;
  onPress: () => void;
  surfaceColor: string;
  textColor: string;
};

function DoneButton({
  disabled,
  onPress,
  surfaceColor,
  textColor,
}: DoneButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Finish colors"
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.doneButton,
        { backgroundColor: surfaceColor },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Feather color={textColor} name="check" size={18} />
    </Pressable>
  );
}

type IconButtonProps = {
  accessibilityLabel: string;
  icon: 'chevron-left' | 'chevron-right' | 'refresh-cw';
  onPress: () => void;
  surfaceColor: string;
  textColor: string;
};

function IconButton({
  accessibilityLabel,
  icon,
  onPress,
  surfaceColor,
  textColor,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.roundButton,
        { backgroundColor: surfaceColor },
        pressed && styles.pressed,
      ]}
    >
      <Feather color={textColor} name={icon} size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  colorControls: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  disabled: {
    opacity: 0.42,
  },
  floatingLabel: {
    fontFamily: typography.family.body,
    fontSize: typography.size.lead,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.lead,
    textAlign: 'center',
  },
  floatingWord: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  floatingWordShell: {
    position: 'absolute',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
  doneButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  progressDot: {
    borderRadius: radius.pill,
    height: 8,
    opacity: 0.72,
    width: 8,
  },
  progressRow: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  root: {
    flex: 1,
  },
  roundButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  safeArea: {
    flex: 1,
  },
  wordField: {
    backgroundColor: colors.transparent,
    flex: 1,
    marginVertical: spacing.xl,
    position: 'relative',
  },
});
