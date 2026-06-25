import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { HueCard } from '@/src/components/HueCard';
import { Screen } from '@/src/components/Screen';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { colors, spacing } from '@/src/theme';

export default function JournalScreen() {
  const router = useRouter();
  const { entries, isLoading, refresh } = useHueEntries();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <Screen>
      <View style={styles.header}>
        <BrandText variant="title">Your color language is beginning.</BrandText>
        <BrandText muted>
          Saved Hue Entries appear here as private visual moments, not clinical
          labels.
        </BrandText>
      </View>

      {entries.length > 0 ? (
        <View style={styles.grid}>
          {entries.map((entry) => (
            <HueCard
              entry={entry}
              key={entry.id}
              onPress={() => router.push(`/entry/${entry.id}`)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <BrandText variant="lead">
            {isLoading ? 'Opening your journal...' : 'No Hue Entries yet.'}
          </BrandText>
          <BrandText muted>
            Create your first color portrait to start the gallery.
          </BrandText>
          <Button onPress={() => router.push('/create/record')}>
            Create Hue Entry
          </Button>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.transparent,
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  header: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
});
