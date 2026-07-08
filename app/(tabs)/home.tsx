import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { HueCanvas } from '@/src/components/HueCanvas';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { SkyStrip } from '@/src/components/SkyStrip';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { clearCreateDraft, loadCreateDraft } from '@/src/lib/createDraft';
import { sampleHueAnalysis } from '@/src/lib/mockHue';
import { breakpoints, colors, radius, spacing, typography } from '@/src/theme';
import type { CreateDraft } from '@/src/types/hue';
import { formatEntryDate } from '@/src/utils/date';

const staleDraftAgeMillis = 5 * 60 * 1000;

function hasResumeableReflection(draft: CreateDraft | null) {
  return Boolean(draft?.reflection.trim());
}

function shouldOfferDraftResume(draft: CreateDraft | null) {
  if (!hasResumeableReflection(draft)) {
    return false;
  }

  const startedAt = draft?.startedAt ? Date.parse(draft.startedAt) : NaN;
  const ageMillis = Number.isFinite(startedAt) ? Date.now() - startedAt : 0;

  return draft?.status === 'pending' || ageMillis >= staleDraftAgeMillis;
}

function formatRelativeDraftTime(isoDate: string) {
  const startedAt = Date.parse(isoDate);

  if (!Number.isFinite(startedAt)) {
    return 'earlier';
  }

  const elapsedSeconds = Math.max(
    0,
    Math.round((Date.now() - startedAt) / 1000),
  );
  const elapsedMinutes = Math.round(elapsedSeconds / 60);

  if (elapsedSeconds < 60) {
    return 'just now';
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} ${elapsedMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} ${elapsedHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const elapsedDays = Math.round(elapsedHours / 24);

  if (elapsedDays === 1) {
    return 'yesterday';
  }

  return `${elapsedDays} days ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { entries, latestEntry, refresh } = useHueEntries();
  const { width } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;
  const [resumeDraft, setResumeDraft] = useState<CreateDraft | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      refresh();

      loadCreateDraft().then((draft) => {
        if (isActive) {
          setResumeDraft(shouldOfferDraftResume(draft) ? draft : null);
        }
      });

      return () => {
        isActive = false;
      };
    }, [refresh]),
  );

  function continueDraft() {
    if (!resumeDraft) {
      return;
    }

    router.push('/create/portrait');
  }

  async function letDraftGo() {
    await clearCreateDraft();
    setResumeDraft(null);
  }

  return (
    <Screen center={!isTablet}>
      <View style={[styles.layout, isTablet && styles.tabletLayout]}>
        <View style={styles.copy}>
          <BrandText variant="title">
            {latestEntry
              ? 'Your most recent Hue is resting here.'
              : 'A quiet Hue space is waiting.'}
          </BrandText>
          <BrandText muted>
            {latestEntry
              ? `Last saved ${formatEntryDate(latestEntry.createdAt)}.`
              : 'Start with voice or text, then adjust the color until it feels close.'}
          </BrandText>
          {resumeDraft ? (
            <View style={styles.resumeCard}>
              <BrandText>
                A reflection from{' '}
                {formatRelativeDraftTime(resumeDraft.startedAt)} is waiting.
              </BrandText>
              <View style={styles.resumeActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={continueDraft}
                  style={({ pressed }) => [
                    styles.resumeAction,
                    styles.resumePrimaryAction,
                    pressed && styles.pressedAction,
                  ]}
                >
                  <BrandText
                    style={styles.resumePrimaryActionText}
                    variant="small"
                  >
                    Continue
                  </BrandText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={letDraftGo}
                  style={({ pressed }) => [
                    styles.resumeAction,
                    styles.resumeGhostAction,
                    pressed && styles.pressedAction,
                  ]}
                >
                  <BrandText
                    style={styles.resumeGhostActionText}
                    variant="small"
                  >
                    Let it go
                  </BrandText>
                </Pressable>
              </View>
            </View>
          ) : null}
          <Button onPress={() => router.push('/create/record')}>
            Create Hue Entry
          </Button>
        </View>

        <View style={styles.canvasColumn}>
          {latestEntry ? (
            <HueCanvas
              analysis={latestEntry.analysis}
              reduceMotion={reduceMotion}
              seedKey={latestEntry.id}
            />
          ) : (
            <View style={styles.samplePortrait}>
              <HueCanvas
                analysis={sampleHueAnalysis}
                reduceMotion
                seedKey="sample"
                style={styles.sampleCanvas}
              />
              <View pointerEvents="none" style={styles.sampleCaption}>
                <BrandText
                  muted
                  style={styles.sampleCaptionText}
                  variant="small"
                >
                  A sample portrait — yours will be one of a kind.
                </BrandText>
              </View>
            </View>
          )}
          {entries.length >= 2 ? (
            <SkyStrip
              entries={entries}
              onPressEntry={(id) => router.push(`/entry/${id}`)}
            />
          ) : null}
          <PrivacyNotice>
            Entries are private by default. The current MVP stores saved entries
            locally on this device.
          </PrivacyNotice>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvasColumn: {
    backgroundColor: colors.transparent,
    flex: 1,
    gap: spacing.md,
  },
  copy: {
    backgroundColor: colors.transparent,
    flex: 1,
    gap: spacing.md,
  },
  layout: {
    backgroundColor: colors.transparent,
    gap: spacing.xl,
  },
  resumeActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  resumeAction: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  resumeCard: {
    backgroundColor: colors.inkSoft,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  resumeGhostAction: {
    backgroundColor: colors.transparent,
  },
  resumeGhostActionText: {
    color: colors.mistMuted,
    fontWeight: typography.weight.semibold,
  },
  resumePrimaryAction: {
    backgroundColor: colors.lavender,
  },
  resumePrimaryActionText: {
    color: colors.ink,
    fontWeight: typography.weight.semibold,
  },
  sampleCanvas: {
    opacity: 0.55,
  },
  sampleCaption: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    bottom: spacing.md,
    justifyContent: 'center',
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
  },
  sampleCaptionText: {
    textAlign: 'center',
  },
  samplePortrait: {
    backgroundColor: colors.transparent,
  },
  pressedAction: {
    opacity: 0.78,
  },
  tabletLayout: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
