import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Privacy Policy</ThemedText>

        <ThemedText type="smallBold">What we collect</ThemedText>
        <ThemedText>
          If you don&apos;t sign in, the app only stores your followed bands locally on your
          device and a push-notification token used to deliver band updates.
        </ThemedText>
        <ThemedText>
          If you sign in (with Apple or Google), we additionally store your account ID and your
          followed-bands list on our servers so they can be restored on a new device.
        </ThemedText>

        <ThemedText type="smallBold">Why</ThemedText>
        <ThemedText>
          This data is used solely to send you push notifications when new content about a band
          you follow is published on metalitalia.com, and to keep your follow list in sync across
          devices.
        </ThemedText>

        <ThemedText type="smallBold">Where it&apos;s stored</ThemedText>
        <ThemedText>
          All data is stored on servers located in the European Union.
        </ThemedText>

        <ThemedText type="smallBold">Your rights</ThemedText>
        <ThemedText>
          You can delete your account and all associated data at any time from Settings &gt;
          Delete account. This immediately removes your stored followed-bands list and account
          ID.
        </ThemedText>

        <ThemedText type="smallBold">Contact</ThemedText>
        <ThemedText>
          For privacy questions or requests, contact the app developer at the email address listed
          on the app&apos;s store page.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
