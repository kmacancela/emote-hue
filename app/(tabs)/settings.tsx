import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useOnboarding } from '@/src/hooks/useOnboarding';
import { readSaveTranscripts, writeSaveTranscripts } from '@/src/lib/settings';
import { colors, radius, spacing } from '@/src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { deleteAllEntries } = useHueEntries();
  const { resetOnboarding } = useOnboarding();
  const [saveTranscripts, setSaveTranscripts] = useState(true);

  useEffect(() => {
    readSaveTranscripts().then(setSaveTranscripts);
  }, []);

  async function updateTranscriptSetting(value: boolean) {
    setSaveTranscripts(value);
    await writeSaveTranscripts(value);
  }

  function confirmDeleteEntries() {
    Alert.alert(
      'Delete local journal?',
      'This deletes saved Hue Entries on this device.',
      [
        { style: 'cancel', text: 'Keep journal' },
        {
          onPress: deleteAllEntries,
          style: 'destructive',
          text: 'Delete local journal',
        },
      ],
    );
  }

  async function handleResetOnboarding() {
    await resetOnboarding();
    router.replace('/onboarding/welcome');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <BrandText variant="title">Privacy controls</BrandText>
        <BrandText muted>
          The current build is local-first. Supabase and server-side AI are
          reserved for a later milestone.
        </BrandText>
      </View>

      <View style={styles.row}>
        <View style={styles.rowCopy}>
          <BrandText>Save typed transcripts</BrandText>
          <BrandText muted variant="small">
            Default is on. Your reflection text is stored privately with each
            entry.
          </BrandText>
        </View>
        <Switch
          onValueChange={updateTranscriptSetting}
          thumbColor={saveTranscripts ? colors.amber : colors.mistMuted}
          trackColor={{ false: colors.lineStrong, true: colors.violetMuted }}
          value={saveTranscripts}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowCopy}>
          <BrandText>Save raw audio</BrandText>
          <BrandText muted variant="small">
            Off for the MVP. Raw audio is not saved by default.
          </BrandText>
        </View>
        <Switch disabled value={false} />
      </View>

      <PrivacyNotice>
        OpenAI API keys must stay server-side. Public Supabase keys can be added
        later only with Row Level Security enabled.
      </PrivacyNotice>

      <Button onPress={confirmDeleteEntries} variant="danger">
        Delete local journal
      </Button>
      <Button onPress={handleResetOnboarding} variant="secondary">
        Reset onboarding
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.inkSoft,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  rowCopy: {
    backgroundColor: colors.transparent,
    flex: 1,
    gap: spacing.xs,
  },
});
