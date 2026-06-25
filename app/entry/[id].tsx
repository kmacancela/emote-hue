import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { EmotionChips } from '@/src/components/EmotionChips';
import { HueCanvas } from '@/src/components/HueCanvas';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { buildShareCardPayload } from '@/src/lib/privacy';
import { colors, radius, spacing } from '@/src/theme';
import { formatEntryDate } from '@/src/utils/date';

export default function EntryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { deleteEntry, entries, refresh } = useHueEntries();
  const [sharePrepared, setSharePrepared] = useState(false);
  const entry = useMemo(
    () => entries.find((item) => item.id === params.id),
    [entries, params.id],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  function confirmDelete() {
    if (!entry) {
      return;
    }

    Alert.alert(
      'Delete this Hue Entry?',
      'This removes the saved entry from local storage.',
      [
        { style: 'cancel', text: 'Keep entry' },
        {
          onPress: async () => {
            await deleteEntry(entry.id);
            router.replace('/(tabs)/journal');
          },
          style: 'destructive',
          text: 'Delete entry',
        },
      ],
    );
  }

  if (!entry) {
    return (
      <Screen center scroll={false}>
        <BrandText variant="title">This entry is not here.</BrandText>
        <Button onPress={() => router.replace('/(tabs)/journal')}>
          Return to journal
        </Button>
      </Screen>
    );
  }

  const sharePayload = buildShareCardPayload(entry);

  return (
    <Screen>
      <View style={styles.header}>
        <BrandText muted variant="small">
          {formatEntryDate(entry.createdAt)}
        </BrandText>
        <BrandText variant="title">
          {entry.title || entry.primaryEmotion}
        </BrandText>
        <BrandText muted>{entry.analysis.userFacingSummary}</BrandText>
      </View>

      <HueCanvas analysis={entry.analysis} />
      <EmotionChips labels={entry.emotionWords} />

      {entry.privateNote ? (
        <View style={styles.note}>
          <BrandText muted variant="small">
            Private note
          </BrandText>
          <BrandText>{entry.privateNote}</BrandText>
        </View>
      ) : null}

      <View style={styles.palette}>
        {entry.analysis.palette.map((color) => (
          <View key={`${color.hex}-${color.role}`} style={styles.paletteRow}>
            <View style={[styles.swatch, { backgroundColor: color.hex }]} />
            <BrandText muted variant="small">
              {color.meaning}
            </BrandText>
          </View>
        ))}
      </View>

      <PrivacyNotice>
        Share/export defaults to art only. Private notes and transcripts stay
        out unless explicitly included.
      </PrivacyNotice>

      {sharePrepared ? (
        <BrandText muted variant="small">
          Art card prepared without private note or transcript. Palette colors:{' '}
          {sharePayload.palette.length}.
        </BrandText>
      ) : null}

      <Button onPress={() => setSharePrepared(true)} variant="secondary">
        Prepare art card
      </Button>
      <Button onPress={confirmDelete} variant="danger">
        Delete entry
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
  note: {
    backgroundColor: colors.inkSoft,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    padding: spacing.md,
  },
  palette: {
    gap: spacing.sm,
  },
  paletteRow: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatch: {
    borderRadius: radius.pill,
    height: 28,
    width: 28,
  },
});
