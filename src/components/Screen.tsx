import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients, spacing } from '@/src/theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  center?: boolean;
  padded?: boolean;
}>;

export function Screen({
  center,
  children,
  padded = true,
  scroll = true,
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentStyle = [
    styles.content,
    padded && styles.padded,
    center && styles.center,
    isTablet && styles.tabletContent,
  ];

  return (
    <LinearGradient colors={gradients.appBackground} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.safeArea}
        >
          {scroll ? (
            <ScrollView
              contentContainerStyle={contentStyle}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={contentStyle}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    width: '100%',
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  root: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  tabletContent: {
    alignSelf: 'center',
    maxWidth: 1040,
    paddingHorizontal: spacing.xxl,
  },
});
