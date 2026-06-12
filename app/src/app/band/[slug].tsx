import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import type { Band } from '@/lib/bands';
import { followBand, getFollowedBands, unfollowBand } from '@/lib/follows';

export default function BandDetailScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const theme = useTheme();
  const [following, setFollowing] = useState(false);

  const band: Band = { slug, name: name ?? slug };

  useEffect(() => {
    getFollowedBands().then((bands) => setFollowing(bands.some((b) => b.slug === slug)));
  }, [slug]);

  const toggleFollow = useCallback(async () => {
    if (following) {
      await unfollowBand(slug);
    } else {
      await followBand(band);
    }
    setFollowing((prev) => !prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [following, slug]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: band.name,
          headerRight: () => (
            <Pressable onPress={toggleFollow} hitSlop={8}>
              <Ionicons
                name={following ? 'heart' : 'heart-outline'}
                size={24}
                color={following ? '#e0245e' : theme.text}
              />
            </Pressable>
          ),
        }}
      />
      <WebView source={{ uri: `https://metalitalia.com/band/${slug}/` }} style={styles.webview} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
