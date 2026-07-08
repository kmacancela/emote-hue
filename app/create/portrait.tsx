import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';
import type { CanvasRef } from '@shopify/react-native-skia';

import { AdjustChip } from '@/src/components/AdjustChip';
import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { EmotionChips } from '@/src/components/EmotionChips';
import { FlowHeader } from '@/src/components/FlowHeader';
import { HueCanvas } from '@/src/components/HueCanvas';
import { IntensityMeter } from '@/src/components/IntensityMeter';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { SupportNotice } from '@/src/components/SupportNotice';
import { useColorCalibration } from '@/src/hooks/useColorCalibration';
import { useHueAnalysis } from '@/src/hooks/useHueAnalysis';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useOnboarding } from '@/src/hooks/useOnboarding';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import {
  clearCreateDraft,
  loadCreateDraft,
  updateDraftAnalysis,
  updateDraftIntensity,
} from '@/src/lib/createDraft';
import { gentleSuccess } from '@/src/lib/haptics';
import { applyIntensity } from '@/src/lib/mockHue';
import { capturePortraitSnapshot } from '@/src/lib/portraitSnapshot';
import { readSaveTranscripts } from '@/src/lib/settings';
import type { CreateDraft, HueAdjustment, HueAnalysis } from '@/src/types/hue';
import { colors, radius, spacing, typography } from '@/src/theme';
import { applyHueAdjustment } from '@/src/utils/color';

const VOICE_REFLECTION_PLACEHOLDER_PREFIX =
  'A private voice reflection was recorded';

const adjustmentControls = [
  { icon: 'feather', label: 'Softer', value: 'softer' },
  { icon: 'sun', label: 'Brighter', value: 'brighter' },
  { icon: 'moon', label: 'Deeper', value: 'deeper' },
  { icon: 'pause', label: 'More still', value: 'more_still' },
  { icon: 'activity', label: 'More alive', value: 'more_alive' },
] as const;

export default function PortraitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ first?: string }>();
  const reduceMotion = useReducedMotion();
  const { calibrations } = useColorCalibration();
  const { analyzeReflection, error, isAnalyzing } = useHueAnalysis();
  const { completeOnboarding } = useOnboarding();
  const { isLoading, saveEntry } = useHueEntries();
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [analysis, setAnalysis] = useState<HueAnalysis | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [privateNote, setPrivateNote] = useState('');
  const [title, setTitle] = useState('');
  const canvasRef = useRef<RefObject<CanvasRef | null> | null>(null);
  const isFirstEntry = params.first === '1';

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
    if (!draft || analysis || isAnalyzing) {
      return;
    }

    let isCancelled = false;

    analyzeReflection(draft.reflection, intensity, calibrations).then(
      (result) => {
        if (isCancelled || !result) {
          return;
        }

        setAnalysis(result);
        setIntensity(result.intensity);
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [
    analysis,
    analyzeReflection,
    calibrations,
    draft,
    intensity,
    isAnalyzing,
  ]);

  useEffect(() => {
    if (!analysis) {
      return;
    }

    void updateDraftAnalysis(analysis);
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

  function updateLiveIntensity(value: number) {
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

  async function startOver() {
    await clearCreateDraft();
    router.replace('/create/record');
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
    <Screen>
      <FlowHeader step={2} totalSteps={2} />
      <View style={styles.stack}>
        <BrandText variant="title">Here is your feeling in color.</BrandText>
        <BrandText muted>
          This color portrait is an interpretation, not a diagnosis.
        </BrandText>
      </View>

      {analysis ? (
        <>
          <HueCanvas
            analysis={analysis}
            onCanvasRef={(ref) => {
              canvasRef.current = ref;
            }}
            reduceMotion={reduceMotion}
            seedKey={draft.startedAt}
          />
          <IntensityMeter
            labels={{ max: 'Vivid', min: 'Soft' }}
            onChange={updateLiveIntensity}
            suggestedValue={draft.intensity}
            value={intensity}
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
          <View style={styles.saveSection}>
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
        <View style={styles.stack}>
          <BrandText variant="lead">
            Translating your reflection into color...
          </BrandText>
          {error ? <BrandText style={styles.error}>{error}</BrandText> : null}
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
  note: {
    minHeight: 112,
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
