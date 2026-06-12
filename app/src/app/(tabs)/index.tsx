import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BandRow } from '@/components/band-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { listBands, searchBands, type Band } from '@/lib/bands';
import { followBand, getFollowedBands, unfollowBand } from '@/lib/follows';

export default function DiscoverScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [bands, setBands] = useState<Band[]>([]);
  const [followedSlugs, setFollowedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFollowed = useCallback(async () => {
    const followed = await getFollowedBands();
    setFollowedSlugs(new Set(followed.map((band) => band.slug)));
  }, []);

  useEffect(() => {
    refreshFollowed();
  }, [refreshFollowed]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = query.trim() ? searchBands(query) : listBands();
    request
      .then((results) => {
        if (!cancelled) setBands(results);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load bands.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleToggleFollow = useCallback(
    async (band: Band) => {
      if (followedSlugs.has(band.slug)) {
        await unfollowBand(band.slug);
      } else {
        await followBand(band);
      }
      await refreshFollowed();
    },
    [followedSlugs, refreshFollowed],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search bands…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundElement }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error && <ThemedText style={styles.message}>{error}</ThemedText>}
        {!error && !loading && bands.length === 0 && (
          <ThemedText style={styles.message} themeColor="textSecondary">
            No bands found.
          </ThemedText>
        )}
        <FlatList
          data={bands}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => (
            <BandRow
              band={item}
              following={followedSlugs.has(item.slug)}
              onToggleFollow={handleToggleFollow}
            />
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  input: {
    margin: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    fontSize: 16,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
});
