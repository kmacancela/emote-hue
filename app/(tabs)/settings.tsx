import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { PrivacyNotice } from '@/src/components/PrivacyNotice';
import { Screen } from '@/src/components/Screen';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { useOnboarding } from '@/src/hooks/useOnboarding';
import { useTypeScale } from '@/src/hooks/useTypeScale';
import {
  readReadbackVoice,
  readSaveTranscripts,
  type TypeScale,
  writeReadbackVoice,
  writeSaveTranscripts,
} from '@/src/lib/settings';
import { colors, radius, spacing, typography } from '@/src/theme';

type ReadbackVoice = Speech.Voice;

const typeScaleChoices: { label: string; value: TypeScale }[] = [
  { label: 'Cozy', value: 'cozy' },
  { label: 'Regular', value: 'regular' },
  { label: 'Roomy', value: 'roomy' },
];

function shortVoiceName(name: string) {
  const cleaned = name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\b(Enhanced|Premium|Compact)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > 18 ? `${cleaned.slice(0, 16)}…` : cleaned;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { deleteAllEntries } = useHueEntries();
  const { resetOnboarding } = useOnboarding();
  const { setTypeScale, typeScale } = useTypeScale();
  const [saveTranscripts, setSaveTranscripts] = useState(true);
  const [readbackVoice, setReadbackVoice] = useState<string | undefined>();
  const [readbackVoices, setReadbackVoices] = useState<ReadbackVoice[]>([]);

  useEffect(() => {
    readSaveTranscripts().then(setSaveTranscripts);
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([readReadbackVoice(), Speech.getAvailableVoicesAsync()])
      .then(([storedVoice, voices]) => {
        if (!isMounted) {
          return;
        }

        const englishVoices = voices
          .filter((voice) => voice.language.toLowerCase().startsWith('en'))
          .slice(0, 8);

        setReadbackVoices(englishVoices);
        setReadbackVoice(
          englishVoices.some((voice) => voice.identifier === storedVoice)
            ? storedVoice
            : undefined,
        );
      })
      .catch(() => {
        if (isMounted) {
          setReadbackVoices([]);
          setReadbackVoice(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateTranscriptSetting(value: boolean) {
    setSaveTranscripts(value);
    await writeSaveTranscripts(value);
  }

  async function updateReadbackVoice(value: string) {
    setReadbackVoice(value);
    await writeReadbackVoice(value);
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
          <BrandText>Text size</BrandText>
          <View style={styles.choiceRow}>
            {typeScaleChoices.map((choice) => {
              const selected = typeScale === choice.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={choice.value}
                  onPress={() => {
                    void setTypeScale(choice.value);
                  }}
                  style={({ pressed }) => [
                    styles.choiceChip,
                    selected && styles.selectedChoice,
                    pressed && styles.pressed,
                  ]}
                >
                  <BrandText
                    style={[
                      styles.choiceLabel,
                      selected && styles.selectedChoiceLabel,
                    ]}
                    variant="small"
                  >
                    {choice.label}
                  </BrandText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {readbackVoices.length > 0 ? (
        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <BrandText>Read-back voice</BrandText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.voiceScroll}
            >
              <View style={styles.voiceRow}>
                {readbackVoices.map((voice) => {
                  const selected = readbackVoice === voice.identifier;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={voice.identifier}
                      onPress={() => {
                        void updateReadbackVoice(voice.identifier);
                      }}
                      style={({ pressed }) => [
                        styles.choiceChip,
                        selected && styles.selectedChoice,
                        pressed && styles.pressed,
                      ]}
                    >
                      <BrandText
                        style={[
                          styles.choiceLabel,
                          selected && styles.selectedChoiceLabel,
                        ]}
                        variant="small"
                      >
                        {shortVoiceName(voice.name)}
                      </BrandText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <BrandText muted variant="small">
              {"Read-back uses your device's voices."}
            </BrandText>
          </View>
        </View>
      ) : null}

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
  choiceChip: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  choiceLabel: {
    color: colors.mist,
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
  },
  choiceRow: {
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
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
  pressed: {
    opacity: 0.78,
  },
  selectedChoice: {
    backgroundColor: colors.lavender,
    borderColor: colors.lavender,
  },
  selectedChoiceLabel: {
    color: colors.ink,
  },
  voiceRow: {
    backgroundColor: colors.transparent,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  voiceScroll: {
    marginRight: -spacing.md,
  },
});
