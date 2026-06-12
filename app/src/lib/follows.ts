import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

import { getBandsBySlug, type Band } from './bands';
import { isFirebaseSupported } from './platform';

const STORAGE_KEY = 'followedBands';

export function topicForBand(slug: string): string {
  return `band-${slug}`;
}

export async function getFollowedBands(): Promise<Band[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Band[]) : [];
}

async function saveFollowedBands(bands: Band[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bands));

  if (!isFirebaseSupported) return;

  const user = auth().currentUser;
  if (user) {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .set(
        { followedBands: bands.map((b) => b.slug), updatedAt: firestore.FieldValue.serverTimestamp() },
        { merge: true },
      );
  }
}

export async function isFollowing(slug: string): Promise<boolean> {
  const followed = await getFollowedBands();
  return followed.some((b) => b.slug === slug);
}

export async function followBand(band: Band): Promise<Band[]> {
  const current = await getFollowedBands();
  if (current.some((b) => b.slug === band.slug)) return current;

  if (isFirebaseSupported) await messaging().subscribeToTopic(topicForBand(band.slug));
  const updated = [...current, band];
  await saveFollowedBands(updated);
  return updated;
}

export async function unfollowBand(slug: string): Promise<Band[]> {
  const current = await getFollowedBands();
  if (!current.some((b) => b.slug === slug)) return current;

  if (isFirebaseSupported) await messaging().unsubscribeFromTopic(topicForBand(slug));
  const updated = current.filter((b) => b.slug !== slug);
  await saveFollowedBands(updated);
  return updated;
}

/** Unsubscribe from every followed topic and clear local state (used on account deletion). */
export async function clearAllFollows(): Promise<void> {
  const current = await getFollowedBands();
  if (isFirebaseSupported) {
    await Promise.all(
      current.map((band) => messaging().unsubscribeFromTopic(topicForBand(band.slug))),
    );
  }
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * After sign-in, merge the account's followed bands (from Firestore) with
 * whatever is already followed on this device, subscribing to any new
 * topics so a phone change doesn't lose notifications.
 */
export async function syncFollowsFromAccount(): Promise<Band[]> {
  if (!isFirebaseSupported) return getFollowedBands();

  const user = auth().currentUser;
  if (!user) return getFollowedBands();

  const doc = await firestore().collection('users').doc(user.uid).get();
  const remoteSlugs = (doc.data()?.followedBands as string[]) ?? [];
  const local = await getFollowedBands();

  const missingSlugs = remoteSlugs.filter((slug) => !local.some((b) => b.slug === slug));
  const remoteBands = await getBandsBySlug(missingSlugs);
  const merged = [...local, ...remoteBands];

  await Promise.all(merged.map((band) => messaging().subscribeToTopic(topicForBand(band.slug))));
  await saveFollowedBands(merged);
  return merged;
}
