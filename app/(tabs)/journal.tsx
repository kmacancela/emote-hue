import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import { Button } from '@/src/components/Button';
import { HueCard } from '@/src/components/HueCard';
import { Screen } from '@/src/components/Screen';
import { SkyStrip } from '@/src/components/SkyStrip';
import { useHueEntries } from '@/src/hooks/useHueEntries';
import { colors, spacing } from '@/src/theme';
import type { HueEntry } from '@/src/types/hue';

export default function JournalScreen() {
  const router = useRouter();
  const { entries, isLoading, refresh } = useHueEntries();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const renderEntry = useCallback(
    ({ item }: { item: HueEntry }) => (
      <View style={styles.gridItem}>
        <HueCard
          entry={item}
          onPress={() => router.push(`/entry/${item.id}`)}
        />
      </View>
    ),
    [router],
  );

  const header = (
    <View style={styles.headerStack}>
      {entries.length > 0 ? (
        <SkyStrip
          entries={entries}
          onPressEntry={(id) => router.push(`/entry/${id}`)}
        />
      ) : null}
      <View style={styles.header}>
        <BrandText variant="title">Your color language is beginning.</BrandText>
        <BrandText muted>
          Saved Hue Entries appear here as private visual moments, not clinical
          labels.
        </BrandText>
      </View>
    </View>
  );

  const emptyState = (
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
  );

  return (
    <Screen scroll={false}>
      <FlatList
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        data={entries}
        keyExtractor={(entry) => entry.id}
        ListEmptyComponent={emptyState}
        ListHeaderComponent={header}
        numColumns={2}
        renderItem={renderEntry}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.transparent,
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
  },
  gridRow: {
    gap: spacing.md,
  },
  header: {
    backgroundColor: colors.transparent,
    gap: spacing.sm,
  },
  headerStack: {
    backgroundColor: colors.transparent,
    gap: spacing.lg,
  },
  listContent: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
