import type { ListRenderItem, StyleProp, ViewStyle } from 'react-native';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { BrandText } from '@/src/components/BrandText';
import type { CuratedPalette } from '@/src/lib/palettes';
import { colors, radius, spacing } from '@/src/theme';

type PaletteSwatchRowProps = {
  onSelect: (palette: CuratedPalette) => void;
  palettes: CuratedPalette[];
  selectedPaletteId?: string | null;
  style?: StyleProp<ViewStyle>;
};

export function PaletteSwatchRow({
  onSelect,
  palettes,
  selectedPaletteId,
  style,
}: PaletteSwatchRowProps) {
  const renderItem: ListRenderItem<CuratedPalette> = ({ item }) => {
    const isSelected = item.id === selectedPaletteId;

    return (
      <Pressable
        accessibilityLabel={`${item.name} palette`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={() => onSelect(item)}
        style={({ pressed }) => [
          styles.card,
          isSelected && styles.selectedCard,
          pressed && styles.pressed,
        ]}
      >
        <BrandText numberOfLines={1} variant="small">
          {item.name}
        </BrandText>
        <View style={styles.swatchStrip}>
          {item.colors.map((color) => (
            <View
              key={`${item.id}-${color.hex}-${color.role}`}
              style={[
                styles.swatch,
                {
                  backgroundColor: color.hex,
                  flex: Math.max(color.weight, 0.08),
                },
              ]}
            />
          ))}
        </View>
        <BrandText muted numberOfLines={2} variant="caption">
          {item.mood}
        </BrandText>
      </Pressable>
    );
  };

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={palettes}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.inkSoft,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    minHeight: 112,
    padding: spacing.sm,
    width: 164,
  },
  content: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  selectedCard: {
    borderColor: colors.amber,
  },
  swatch: {
    height: '100%',
  },
  swatchStrip: {
    borderRadius: radius.pill,
    flexDirection: 'row',
    height: 18,
    overflow: 'hidden',
  },
});
