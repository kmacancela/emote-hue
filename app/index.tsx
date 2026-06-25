import { Redirect } from 'expo-router';

import { BrandText } from '@/src/components/BrandText';
import { Screen } from '@/src/components/Screen';
import { useOnboarding } from '@/src/hooks/useOnboarding';

export default function IndexScreen() {
  const { completed, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <Screen center scroll={false}>
        <BrandText variant="title">Emote Hue</BrandText>
      </Screen>
    );
  }

  return <Redirect href={completed ? '/(tabs)/home' : '/onboarding/welcome'} />;
}
