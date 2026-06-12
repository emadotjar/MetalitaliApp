import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Band } from '@/lib/bands';

interface BandRowProps {
  band: Band;
  following: boolean;
  onToggleFollow: (band: Band) => void;
}

export function BandRow({ band, following, onToggleFollow }: BandRowProps) {
  const theme = useTheme();

  return (
    <Link href={{ pathname: '/band/[slug]', params: { slug: band.slug, name: band.name } }} asChild>
      <Pressable style={styles.row}>
        <ThemedText style={styles.name}>{band.name}</ThemedText>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onToggleFollow(band);
          }}
          hitSlop={8}>
          <Ionicons
            name={following ? 'heart' : 'heart-outline'}
            size={22}
            color={following ? '#e0245e' : theme.textSecondary}
          />
        </Pressable>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  name: {
    flex: 1,
    marginRight: Spacing.two,
  },
});
