import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  deleteAccount,
  isAppleSignInAvailable,
  signInWithApple,
  signInWithGoogle,
  signOut,
  useAuthUser,
} from '@/lib/auth';
import { syncFollowsFromAccount } from '@/lib/follows';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from '@/lib/notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthUser();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotificationPermissionStatus>('undetermined');

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
    getNotificationPermissionStatus().then(setNotifStatus);
  }, []);

  const handleAppleSignIn = useCallback(async () => {
    try {
      await signInWithApple();
      await syncFollowsFromAccount();
    } catch (err) {
      Alert.alert('Sign in failed', (err as Error).message);
    }
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const completed = await signInWithGoogle();
      if (completed) await syncFollowsFromAccount();
    } catch (err) {
      Alert.alert('Sign in failed', (err as Error).message);
    }
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and followed bands. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (err) {
              Alert.alert('Could not delete account', (err as Error).message);
            }
          },
        },
      ],
    );
  }, []);

  const handleRequestNotifications = useCallback(async () => {
    setNotifStatus(await requestNotificationPermission());
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="subtitle">Account</ThemedText>
          {user ? (
            <>
              <ThemedText themeColor="textSecondary">
                Signed in{user.displayName ? ` as ${user.displayName}` : ''}
              </ThemedText>
              <SettingsButton label="Sign out" onPress={signOut} />
              <SettingsButton label="Delete account" destructive onPress={handleDeleteAccount} />
            </>
          ) : (
            <>
              <ThemedText themeColor="textSecondary">
                Sign in to keep your followed bands when you switch phones.
              </ThemedText>
              {appleAvailable && (
                <SettingsButton label="Sign in with Apple" onPress={handleAppleSignIn} />
              )}
              <SettingsButton label="Sign in with Google" onPress={handleGoogleSignIn} />
            </>
          )}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="subtitle">Notifications</ThemedText>
          <ThemedText themeColor="textSecondary">Status: {notifStatus}</ThemedText>
          {notifStatus !== 'granted' && (
            <SettingsButton label="Enable notifications" onPress={handleRequestNotifications} />
          )}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <SettingsButton label="Privacy policy" onPress={() => router.push('/privacy')} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SettingsButton({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <ThemedText style={destructive ? styles.destructive : undefined}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.three, gap: Spacing.three },
  section: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  button: { paddingVertical: Spacing.two },
  pressed: { opacity: 0.6 },
  destructive: { color: '#e0245e' },
});
