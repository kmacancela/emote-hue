import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { EmotionChips } from '@/src/components/EmotionChips';
import { FlowHeader } from '@/src/components/FlowHeader';
import { HueCanvas } from '@/src/components/HueCanvas';
import { Screen } from '@/src/components/Screen';
import { SupportNotice } from '@/src/components/SupportNotice';
import { useColorCalibration } from '@/src/hooks/useColorCalibration';
import { useHueAnalysis } from '@/src/hooks/useHueAnalysis';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { loadCreateDraft, updateDraftAnalysis } from '@/src/lib/createDraft';
import type { CreateDraft, HueAdjustment, HueAnalysis } from '@/src/types/hue';
import { applyHueAdjustment } from '@/src/utils/color';
import { colors, spacing } from '@/src/theme';

const adjustmentLabels: { label: string; value: HueAdjustment }[] = [
  { label: 'Softer', value: 'softer' },
  { label: 'Brighter', value: 'brighter' },
  { label: 'Deeper', value: 'deeper' },
  { label: 'More still', value: 'more_still' },
  { label: 'More alive', value: 'more_alive' },
];

export default function PortraitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ first?: string }>();
  const reduceMotion = useReducedMotion();
  const { calibrations } = useColorCalibration();
  const { analyzeReflection, error, isAnalyzing } = useHueAnalysis();
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [analysis, setAnalysis] = useState<HueAnalysis | null>(null);

  useEffect(() => {
    loadCreateDraft().then((stored) => {
      setDraft(stored);
      setAnalysis(stored?.analysis ?? null);
    });
  }, []);

  useEffect(() => {
    if (!draft || analysis || isAnalyzing) {
      return;
    }

    analyzeReflection(draft.reflection, draft.intensity, calibrations).then(
      async (result) => {
        if (result) {
          setAnalysis(result);
          await updateDraftAnalysis(result);
        }
      },
    );
  }, [analysis, analyzeReflection, calibrations, draft, isAnalyzing]);

  async function adjustPortrait(adjustment: HueAdjustment) {
    if (!analysis) {
      return;
    }

    const next = applyHueAdjustment(analysis, adjustment);
    setAnalysis(next);
    await updateDraftAnalysis(next);
  }

  if (!draft) {
    return (
      <Screen scroll={false}>
        <FlowHeader step={3} />
        <View style={styles.emptyState}>
          <BrandText variant="title">No reflection is waiting.</BrandText>
          <Button onPress={() => router.replace('/create/record')}>
            Create Hue Entry
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlowHeader step={3} />
      <View style={styles.stack}>
        <BrandText variant="title">Here is your feeling in color.</BrandText>
        <BrandText muted>
          This color portrait is an interpretation, not a diagnosis.
        </BrandText>
      </View>

      {analysis ? (
        <>
          <HueCanvas analysis={analysis} reduceMotion={reduceMotion} />
          {analysis.safetyFlags.crisisLanguage ||
          analysis.safetyFlags.selfHarmLanguage ? (
            <SupportNotice />
          ) : null}
          <BrandText muted>{analysis.userFacingSummary}</BrandText>
          <EmotionChips labels={analysis.emotionWords} />
          <View style={styles.controls}>
            {adjustmentLabels.map((item) => (
              <Button
                key={item.value}
                onPress={() => adjustPortrait(item.value)}
                variant="secondary"
              >
                {item.label}
              </Button>
            ))}
          </View>
          <Button
            onPress={() =>
              router.push({
                pathname: '/create/save',
                params: params.first ? { first: params.first } : {},
              })
            }
          >
            Save this Hue Entry
          </Button>
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
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
