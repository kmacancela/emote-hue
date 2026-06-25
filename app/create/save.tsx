import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { HueCanvas } from '@/src/components/HueCanvas';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useOnboarding } from '@/src/hooks/useOnboarding';
import { clearCreateDraft, loadCreateDraft } from '@/src/lib/createDraft';
import { gentleSuccess } from '@/src/lib/haptics';
import type { CreateDraft } from '@/src/types/hue';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function SaveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ first?: string }>();
  const { completeOnboarding } = useOnboarding();
  const { isLoading, saveEntry } = useHueEntries();
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [title, setTitle] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const isFirstEntry = params.first === '1';

  useEffect(() => {
    loadCreateDraft().then(setDraft);
  }, []);

  async function savePrivately() {
    if (!draft?.analysis || isLoading) {
      return;
    }

    await saveEntry({
      analysis: draft.analysis,
      privateNote,
      title,
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

  if (!draft?.analysis) {
    return (
      <Screen center scroll={false}>
        <BrandText variant="title">No portrait is waiting.</BrandText>
        <Button onPress={() => router.replace('/create/record')}>
          Create Hue Entry
        </Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.stack}>
        <BrandText variant="title">
          Save this as your first Hue Entry?
        </BrandText>
        {!isFirstEntry ? (
          <BrandText muted>Your color language keeps growing.</BrandText>
        ) : null}
      </View>
      <HueCanvas analysis={draft.analysis} reduceMotion />
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
        Save privately stores the Hue Portrait and your optional note in local
        MVP storage. Raw audio is not saved.
      </PrivacyNotice>
      <Button disabled={isLoading} onPress={savePrivately}>
        Save privately
      </Button>
      <Button onPress={() => router.replace('/create/record')} variant="ghost">
        Start over
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  stack: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
