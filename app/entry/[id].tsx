import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { EmotionChips } from '@/src/components/EmotionChips';
import { HueCanvas } from '@/src/components/HueCanvas';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { ShareCard } from '@/src/components/ShareCard';
import type { ShareCardFormat } from '@/src/components/ShareCard';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useReadback } from '@/src/hooks/useReadback';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { buildShareCardPayload } from '@/src/lib/privacy';
import { shareEntryCard } from '@/src/lib/shareCard';
import { colors, radius, spacing } from '@/src/theme';
import { formatEntryDate } from '@/src/utils/date';

function waitForCardMount() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

export default function EntryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { deleteEntry, entries, refresh } = useHueEntries();
  const { isSpeaking, speak, stop } = useReadback();
  const reduceMotion = useReducedMotion();
  const shareCardRef = useRef<View | null>(null);
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const [pendingShareFormat, setPendingShareFormat] =
    useState<ShareCardFormat | null>(null);
  const [shareUnavailable, setShareUnavailable] = useState(false);
  const entry = useMemo(
    () => entries.find((item) => item.id === params.id),
    [entries, params.id],
  );
  const sharePayload = useMemo(
    () => (entry ? buildShareCardPayload(entry) : null),
    [entry],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!entry || !pendingShareFormat || !sharePayload) {
      return;
    }

    let isActive = true;
    const entryId = entry.id;
    const format = pendingShareFormat;

    async function captureShareCard() {
      setIsPreparingShare(true);
      await waitForCardMount();

      const didShare = await shareEntryCard({
        format,
        id: entryId,
        viewRef: shareCardRef,
      });

      if (!isActive) {
        return;
      }

      setShareUnavailable(!didShare);
      setPendingShareFormat(null);
      setIsPreparingShare(false);
    }

    void captureShareCard();

    return () => {
      isActive = false;
    };
  }, [entry, pendingShareFormat, sharePayload]);

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

  function requestShare(format: ShareCardFormat) {
    if (isPreparingShare) {
      return;
    }

    setShareUnavailable(false);
    setPendingShareFormat(format);
  }

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

      <HueCanvas analysis={entry.analysis} seedKey={entry.id} />
      <EmotionChips labels={entry.emotionWords} />

      {entry.privateNote ? (
        <View style={styles.note}>
          <BrandText muted variant="small">
            Private note
          </BrandText>
          <BrandText>{entry.privateNote}</BrandText>
        </View>
      ) : null}

      {entry.transcript ? (
        <View style={styles.note}>
          <View style={styles.noteHeader}>
            <BrandText muted variant="small">
              Transcript
            </BrandText>
            <Pressable
              accessibilityLabel={
                isSpeaking ? 'Stop transcript read-back' : 'Play transcript'
              }
              accessibilityRole="button"
              onPress={() => {
                if (isSpeaking) {
                  stop();
                  return;
                }

                speak(entry.transcript ?? '');
              }}
              style={({ pressed }) => [
                styles.readbackButton,
                pressed && styles.pressed,
              ]}
            >
              <Feather
                color={colors.mist}
                name={isSpeaking ? 'square' : 'volume-2'}
                size={15}
              />
            </Pressable>
          </View>
          <BrandText>{entry.transcript}</BrandText>
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

      {shareUnavailable ? (
        <BrandText muted variant="small">
          {"Sharing isn't available on this device."}
        </BrandText>
      ) : null}

      <View style={styles.shareActions}>
        <View style={styles.shareButton}>
          <Button
            disabled={isPreparingShare}
            onPress={() => requestShare('square')}
            variant="secondary"
          >
            {isPreparingShare ? 'Preparing…' : 'Share square card'}
          </Button>
        </View>
        <View style={styles.shareButton}>
          <Button
            disabled={isPreparingShare}
            onPress={() => requestShare('story')}
            variant="secondary"
          >
            {isPreparingShare ? 'Preparing…' : 'Share story card'}
          </Button>
        </View>
      </View>

      {pendingShareFormat && sharePayload ? (
        <View pointerEvents="none" style={styles.offscreenShareCard}>
          <ShareCard
            entry={sharePayload}
            format={pendingShareFormat}
            reduceMotion={reduceMotion}
            ref={shareCardRef}
          />
        </View>
      ) : null}

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
  noteHeader: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  pressed: {
    opacity: 0.78,
  },
  readbackButton: {
    alignItems: 'center',
    backgroundColor: colors.inkRaised,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  swatch: {
    borderRadius: radius.pill,
    height: 28,
    width: 28,
  },
  offscreenShareCard: {
    left: -9999,
    position: 'absolute',
    top: 0,
  },
  shareActions: {
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shareButton: {
    flex: 1,
    minWidth: 0,
  },
});
