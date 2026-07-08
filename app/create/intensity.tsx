import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { FlowHeader } from '@/src/components/FlowHeader';
import { IntensityMeter } from '@/src/components/IntensityMeter';
import { Screen } from '@/src/components/Screen';
import type { CreateDraft } from '@/src/types/hue';
import { loadCreateDraft, updateDraftIntensity } from '@/src/lib/createDraft';
import { colors, spacing } from '@/src/theme';

export default function IntensityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ first?: string }>();
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [intensity, setIntensity] = useState(5);

  useEffect(() => {
    loadCreateDraft().then((stored) => {
      setDraft(stored);
      setIntensity(stored?.intensity ?? 5);
    });
  }, []);

  async function continueToPortrait() {
    await updateDraftIntensity(intensity);
    router.push({
      pathname: '/create/portrait',
      params: params.first ? { first: params.first } : {},
    });
  }

  if (!draft) {
    return (
      <Screen scroll={false}>
        <FlowHeader step={2} />
        <View style={styles.emptyState}>
          <BrandText variant="title">No reflection is waiting.</BrandText>
          <BrandText muted>
            Start with a few words, then shape the intensity.
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
      <FlowHeader step={2} />
      <View style={styles.stack}>
        <BrandText variant="title">
          How strong does this feeling feel?
        </BrandText>
        <BrandText muted>
          Emote Hue can suggest a level later. For now, make it yours.
        </BrandText>
      </View>
      <IntensityMeter
        onChange={setIntensity}
        suggestedValue={draft.intensity}
        value={intensity}
      />
      <Button onPress={continueToPortrait}>Shape portrait</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    backgroundColor: colors.transparent,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
