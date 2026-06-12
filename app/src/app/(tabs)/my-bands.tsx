import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BandRow } from '@/components/band-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Band } from '@/lib/bands';
import { getFollowedBands, unfollowBand } from '@/lib/follows';

export default function MyBandsScreen() {
  const [bands, setBands] = useState<Band[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFollowedBands().then(setBands);
    }, []),
  );

  const handleUnfollow = useCallback(async (band: Band) => {
    const updated = await unfollowBand(band.slug);
    setBands(updated);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {bands.length === 0 ? (
          <ThemedText style={styles.message} themeColor="textSecondary">
            You&apos;re not following any bands yet. Find bands in Discover and tap the heart to
            follow them.
          </ThemedText>
        ) : (
          <FlatList
            data={bands}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <BandRow band={item} following onToggleFollow={handleUnfollow} />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  message: {
    textAlign: 'center',
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
});
