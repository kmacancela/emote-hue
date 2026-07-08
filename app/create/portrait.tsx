import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  findNodeHandle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { CanvasRef } from '@shopify/react-native-skia';

import { AdjustChip } from '@/src/components/AdjustChip';
import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { EmotionChips } from '@/src/components/EmotionChips';
import { FlowHeader } from '@/src/components/FlowHeader';
import { HueCanvas } from '@/src/components/HueCanvas';
import { IntensityMeter } from '@/src/components/IntensityMeter';
import { PaletteSwatchRow } from '@/src/components/PaletteSwatchRow';
import { PinchToFinish } from '@/src/components/PinchToFinish';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { SupportNotice } from '@/src/components/SupportNotice';
import {
  TiltModeControls,
  type TiltMode,
} from '@/src/components/TiltModeControls';
import { useColorCalibration } from '@/src/hooks/useColorCalibration';
import { useHueAnalysis } from '@/src/hooks/useHueAnalysis';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useOnboarding } from '@/src/hooks/useOnboarding';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useTiltControl } from '@/src/hooks/useTiltControl';
import {
  clearCreateDraft,
  loadCreateDraft,
  updateDraftAnalysis,
  updateDraftIntensity,
} from '@/src/lib/createDraft';
import { computeRiverState, getPaletteUnlockDay } from '@/src/lib/colorRiver';
import { gentleSelection, gentleSuccess } from '@/src/lib/haptics';
import { applyIntensity } from '@/src/lib/mockHue';
import { curatedPalettes } from '@/src/lib/palettes';
import type { CuratedPalette } from '@/src/lib/palettes';
import { capturePortraitSnapshot } from '@/src/lib/portraitSnapshot';
import { readSaveTranscripts } from '@/src/lib/settings';
import type {
  CreateDraft,
  HueAdjustment,
  HueAnalysis,
  HuePaletteColor,
} from '@/src/types/hue';
import { colors, radius, spacing, typography } from '@/src/theme';
import { applyHueAdjustment, normalizeHueAnalysis } from '@/src/utils/color';

const VOICE_REFLECTION_PLACEHOLDER_PREFIX =
  'A private voice reflection was recorded';
const FINALE_BOOST_MS = 1800;
const TILT_INTENSITY_STEP = 0.35;
const TILT_VISUAL_STEP = 0.025;

const adjustmentControls = [
  { icon: 'feather', label: 'Softer', value: 'softer' },
  { icon: 'sun', label: 'Brighter', value: 'brighter' },
  { icon: 'moon', label: 'Deeper', value: 'deeper' },
  { icon: 'pause', label: 'More still', value: 'more_still' },
  { icon: 'activity', label: 'More alive', value: 'more_alive' },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function PortraitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ first?: string }>();
  const reduceMotion = useReducedMotion();
  const { calibrations, isLoading: isCalibrationLoading } =
    useColorCalibration();
  const { analyzeReflection, error } = useHueAnalysis();
  const { completeOnboarding } = useOnboarding();
  const { entries, isLoading, saveEntry } = useHueEntries();
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [analysis, setAnalysis] = useState<HueAnalysis | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [finaleIntensity, setFinaleIntensity] = useState<number | null>(null);
  const [privateNote, setPrivateNote] = useState('');
  const [title, setTitle] = useState('');
  const [isPaletteLibraryOpen, setIsPaletteLibraryOpen] = useState(false);
  const [originalAnalyzedPalette, setOriginalAnalyzedPalette] = useState<
    HuePaletteColor[] | null
  >(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    null,
  );
  const [tiltMode, setTiltMode] = useState<TiltMode>('touch');
  const canvasRef = useRef<RefObject<CanvasRef | null> | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const saveSectionRef = useRef<View | null>(null);
  const finaleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisRequestIdRef = useRef(0);
  const tiltIntensityRef = useRef(intensity);
  const intensityValueRef = useRef(intensity);
  const [analysisAttempt, setAnalysisAttempt] = useState(0);
  const isFirstEntry = params.first === '1';
  const riverState = useMemo(() => computeRiverState(entries), [entries]);
  const unlockedPaletteIds = useMemo(
    () => new Set(riverState.unlockedPaletteIds),
    [riverState.unlockedPaletteIds],
  );
  const lockedPaletteLabels = useMemo(
    () =>
      curatedPalettes.reduce<Record<string, string | undefined>>(
        (labels, palette, index) => {
          if (!unlockedPaletteIds.has(palette.id)) {
            labels[palette.id] = `Flows at ${getPaletteUnlockDay(index)} days`;
          }

          return labels;
        },
        {},
      ),
    [unlockedPaletteIds],
  );
  const hasLockedPalettes = useMemo(
    () => Object.values(lockedPaletteLabels).some(Boolean),
    [lockedPaletteLabels],
  );
  const displayIntensity = finaleIntensity ?? intensity;
  const displayAnalysis = useMemo(() => {
    if (!analysis) {
      return null;
    }

    return finaleIntensity
      ? applyIntensity(analysis, finaleIntensity)
      : analysis;
  }, [analysis, finaleIntensity]);
  const activeTiltMode = reduceMotion ? 'touch' : tiltMode;

  useEffect(() => {
    let isMounted = true;

    loadCreateDraft().then((stored) => {
      if (!isMounted) {
        return;
      }

      setDraft(stored);
      setAnalysis(stored?.analysis ?? null);
      setIntensity(stored?.intensity ?? 5);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!draft || analysis || isCalibrationLoading) {
      return;
    }

    const requestId = analysisRequestIdRef.current + 1;
    analysisRequestIdRef.current = requestId;

    analyzeReflection(draft.reflection, intensity, calibrations).then(
      (result) => {
        if (analysisRequestIdRef.current !== requestId || !result) {
          return;
        }

        setAnalysis(result);
        setIntensity(result.intensity);
      },
    );

    return () => {
      if (analysisRequestIdRef.current === requestId) {
        analysisRequestIdRef.current += 1;
      }
    };
  }, [
    analysisAttempt,
    analysis,
    analyzeReflection,
    calibrations,
    draft,
    intensity,
    isCalibrationLoading,
  ]);

  useEffect(() => {
    if (!analysis) {
      return;
    }

    const persistTimer = setTimeout(() => {
      void updateDraftAnalysis(analysis);
    }, 180);

    return () => {
      clearTimeout(persistTimer);
    };
  }, [analysis]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    const persistTimer = setTimeout(() => {
      void updateDraftIntensity(intensity);
    }, 180);

    return () => {
      clearTimeout(persistTimer);
    };
  }, [draft, intensity]);

  useEffect(() => {
    tiltIntensityRef.current = intensity;
    intensityValueRef.current = intensity;
  }, [intensity]);

  useEffect(
    () => () => {
      if (finaleTimerRef.current) {
        clearTimeout(finaleTimerRef.current);
      }
    },
    [],
  );

  const handleTiltDelta = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      if (activeTiltMode === 'intensity') {
        const nextFloat = clamp(
          tiltIntensityRef.current + y * TILT_INTENSITY_STEP,
          1,
          10,
        );
        const nextInteger = Math.round(nextFloat);

        tiltIntensityRef.current = nextFloat;

        if (nextInteger !== intensityValueRef.current) {
          intensityValueRef.current = nextInteger;
          setIntensity(nextInteger);
          setAnalysis((current) =>
            current ? applyIntensity(current, nextInteger) : current,
          );
          void gentleSelection();
        }

        return;
      }

      if (activeTiltMode === 'warmthLight') {
        setAnalysis((current) => {
          if (!current) {
            return current;
          }

          const nextWarmth = clamp(
            current.visual.warmth + x * TILT_VISUAL_STEP,
            0,
            1,
          );
          const nextBrightness = clamp(
            current.visual.brightness + y * TILT_VISUAL_STEP,
            0,
            1,
          );

          if (
            nextWarmth === current.visual.warmth &&
            nextBrightness === current.visual.brightness
          ) {
            return current;
          }

          return normalizeHueAnalysis({
            ...current,
            visual: {
              ...current.visual,
              brightness: nextBrightness,
              warmth: nextWarmth,
            },
          });
        });
      }
    },
    [activeTiltMode],
  );

  const { isAvailable: isTiltAvailable } = useTiltControl({
    enabled: activeTiltMode !== 'touch',
    onDelta: handleTiltDelta,
  });

  function updateLiveIntensity(value: number) {
    tiltIntensityRef.current = value;
    intensityValueRef.current = value;
    setIntensity(value);
    setAnalysis((current) =>
      current ? applyIntensity(current, value) : current,
    );
  }

  function adjustPortrait(adjustment: HueAdjustment) {
    setAnalysis((current) =>
      current ? applyHueAdjustment(current, adjustment) : current,
    );
  }

  function selectCuratedPalette(palette: CuratedPalette) {
    if (!analysis) {
      return;
    }

    setOriginalAnalyzedPalette((current) => current ?? analysis.palette);
    setSelectedPaletteId(palette.id);
    setAnalysis(
      normalizeHueAnalysis({
        ...analysis,
        palette: palette.colors,
      }),
    );
  }

  function restoreOriginalPalette() {
    if (!analysis || !originalAnalyzedPalette) {
      return;
    }

    setSelectedPaletteId(null);
    setAnalysis(
      normalizeHueAnalysis({
        ...analysis,
        palette: originalAnalyzedPalette,
      }),
    );
  }

  function revealSaveSection() {
    requestAnimationFrame(() => {
      const scrollNode = findNodeHandle(scrollRef.current);

      if (!scrollNode || !saveSectionRef.current) {
        return;
      }

      saveSectionRef.current.measureLayout(
        scrollNode,
        (_x, y) => {
          scrollRef.current?.scrollTo({
            animated: !reduceMotion,
            y: Math.max(0, y - spacing.lg),
          });
        },
        () => undefined,
      );
    });
  }

  function handleFinishReveal() {
    if (!analysis) {
      return;
    }

    const boostedIntensity = Math.min(10, intensity + 2);

    setFinaleIntensity(boostedIntensity);

    if (finaleTimerRef.current) {
      clearTimeout(finaleTimerRef.current);
    }

    finaleTimerRef.current = setTimeout(() => {
      setFinaleIntensity(null);
      finaleTimerRef.current = null;
    }, FINALE_BOOST_MS);

    setTimeout(revealSaveSection, reduceMotion ? 0 : 220);
  }

  async function startOver() {
    await clearCreateDraft();
    router.replace('/create/record');
  }

  function returnToReflection() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/create/record');
  }

  function retryAnalysis() {
    analysisRequestIdRef.current += 1;
    setAnalysisAttempt((current) => current + 1);
  }

  async function savePrivately() {
    if (!draft || !analysis || isLoading) {
      return;
    }

    const saveTranscripts = await readSaveTranscripts();
    const reflection = draft.reflection.trim();
    const transcript =
      saveTranscripts &&
      reflection.length > 0 &&
      !reflection.startsWith(VOICE_REFLECTION_PLACEHOLDER_PREFIX)
        ? reflection
        : undefined;
    const staticPreviewUri = await capturePortraitSnapshot(canvasRef.current);

    await saveEntry({
      analysis,
      privateNote,
      staticPreviewUri,
      title,
      transcript,
      transcriptSummary:
        draft.mode === 'voice'
          ? 'Voice reflection translated without saving raw audio.'
          : 'Typed reflection translated without saving the full text by default.',
    });
    await clearCreateDraft();

    if (isFirstEntry) {
      await completeOnboarding();
    }

    await gentleSuccess();
    router.replace('/(tabs)/journal');
  }

  if (!draft) {
    return (
      <Screen scroll={false}>
        <FlowHeader step={2} totalSteps={2} />
        <View style={styles.emptyState}>
          <BrandText variant="title">No reflection is waiting.</BrandText>
          <BrandText muted>
            Start with a few words, then shape the portrait.
          </BrandText>
          <Button onPress={() => router.replace('/create/record')}>
            Create Hue Entry
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollRef={scrollRef}>
      <FlowHeader step={2} totalSteps={2} />
      <View style={styles.stack}>
        <BrandText variant="title">Here is your feeling in color.</BrandText>
        <BrandText muted>
          This color portrait is an interpretation, not a diagnosis.
        </BrandText>
      </View>

      {analysis && displayAnalysis ? (
        <>
          <PinchToFinish
            onFinish={handleFinishReveal}
            reduceMotion={reduceMotion}
          >
            <HueCanvas
              analysis={displayAnalysis}
              onCanvasRef={(ref) => {
                canvasRef.current = ref;
              }}
              reduceMotion={reduceMotion}
              seedKey={draft.startedAt}
            />
          </PinchToFinish>
          <TiltModeControls
            disabled={reduceMotion}
            isAvailable={isTiltAvailable}
            mode={activeTiltMode}
            onModeChange={setTiltMode}
          />
          <IntensityMeter
            labels={{ max: 'Vivid', min: 'Soft' }}
            onChange={updateLiveIntensity}
            suggestedValue={draft.intensity}
            value={displayIntensity}
          />
          {analysis.safetyFlags.crisisLanguage ||
          analysis.safetyFlags.selfHarmLanguage ? (
            <SupportNotice />
          ) : null}
          <BrandText muted>{analysis.userFacingSummary}</BrandText>
          <View style={styles.adjustments}>
            {adjustmentControls.map((item) => (
              <AdjustChip
                icon={item.icon}
                key={item.value}
                label={item.label}
                onPress={() => adjustPortrait(item.value)}
              />
            ))}
          </View>
          <EmotionChips labels={analysis.emotionWords} />
          <View style={styles.paletteLibrary}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isPaletteLibraryOpen }}
              onPress={() => setIsPaletteLibraryOpen((current) => !current)}
              style={({ pressed }) => [
                styles.paletteLibraryHeader,
                pressed && styles.pressed,
              ]}
            >
              <BrandText variant="small">Choose a different palette</BrandText>
              <Feather
                color={colors.mistMuted}
                name={isPaletteLibraryOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
              />
            </Pressable>
            {isPaletteLibraryOpen ? (
              <View style={styles.paletteLibraryContent}>
                {hasLockedPalettes ? (
                  <BrandText muted variant="small">
                    Your Color River grows as you return — {riverState.flowDays}{' '}
                    of 30 days so far.
                  </BrandText>
                ) : null}
                <PaletteSwatchRow
                  lockedPaletteLabels={lockedPaletteLabels}
                  onSelect={selectCuratedPalette}
                  palettes={curatedPalettes}
                  selectedPaletteId={selectedPaletteId}
                />
                {originalAnalyzedPalette && selectedPaletteId ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={restoreOriginalPalette}
                    style={({ pressed }) => [
                      styles.backToColorsChip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.backToColorsLabel}>
                      Back to my colors
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
          <View ref={saveSectionRef} style={styles.saveSection}>
            <BrandText variant="lead">
              {isFirstEntry
                ? 'Save this as your first Hue Entry?'
                : 'Save this Hue Entry?'}
            </BrandText>
            <TextInput
              accessibilityLabel="Entry title"
              onChangeText={setTitle}
              placeholder="Optional title"
              placeholderTextColor={colors.smoke}
              style={styles.input}
              value={title}
            />
            <TextInput
              accessibilityLabel="Private note"
              multiline
              onChangeText={setPrivateNote}
              placeholder="Optional private note"
              placeholderTextColor={colors.smoke}
              style={[styles.input, styles.note]}
              textAlignVertical="top"
              value={privateNote}
            />
            <PrivacyNotice>
              Save privately stores the Hue Portrait and your optional note in
              local MVP storage. Raw audio is not saved.
            </PrivacyNotice>
            <Button disabled={isLoading} onPress={savePrivately}>
              Save privately
            </Button>
            <Button onPress={startOver} variant="ghost">
              Start over
            </Button>
          </View>
        </>
      ) : (
        <View style={styles.loadingStack}>
          <BrandText variant="lead">
            {isCalibrationLoading
              ? 'Gathering your color choices...'
              : 'Translating your reflection into color...'}
          </BrandText>
          <BrandText muted>
            A portrait should appear in a moment. You can go back if you want
            to change your words.
          </BrandText>
          {error ? <BrandText style={styles.error}>{error}</BrandText> : null}
          {error ? (
            <Button onPress={retryAnalysis} variant="secondary">
              Try again
            </Button>
          ) : null}
          <Button onPress={returnToReflection} variant="ghost">
            Back to reflection
          </Button>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  adjustments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  emptyState: {
    backgroundColor: colors.transparent,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  error: {
    color: colors.danger,
  },
  input: {
    backgroundColor: colors.inkSoft,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.mist,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    minHeight: 52,
    padding: spacing.md,
  },
  loadingStack: {
    backgroundColor: colors.transparent,
    gap: spacing.md,
  },
  note: {
    minHeight: 112,
  },
  backToColorsChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.transparent,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 38,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  backToColorsLabel: {
    color: colors.mist,
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.small,
  },
  paletteLibrary: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
  paletteLibraryContent: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
  paletteLibraryHeader: {
    alignItems: 'center',
    backgroundColor: colors.inkSoft,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.78,
  },
  saveSection: {
    backgroundColor: colors.transparent,
    gap: spacing.md,
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
