import { getApp } from '@react-native-firebase/app';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { clearAllFollows } from './follows';
import { isFirebaseSupported } from './platform';

const FUNCTIONS_REGION = 'europe-west1';

// Firebase web client ID (OAuth client type 3), used by Google Sign-In on
// both Android and iOS. Find it in the Firebase console under
// Authentication > Sign-in method > Google, or in google-services.json. See
// SETUP.md.
const GOOGLE_WEB_CLIENT_ID = 'REPLACE_WITH_FIREBASE_WEB_CLIENT_ID';

export function useAuthUser(): FirebaseAuthTypes.User | null {
  const [user, setUser] = useState(isFirebaseSupported ? auth().currentUser : null);

  useEffect(() => {
    if (!isFirebaseSupported) return undefined;
    return auth().onAuthStateChanged(setUser);
  }, []);

  return user;
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  return Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync());
}

export async function signInWithApple(): Promise<void> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('Apple sign-in did not return an identity token.');
  }

  const provider = auth.AppleAuthProvider.credential(credential.identityToken, rawNonce);
  await auth().signInWithCredential(provider);
}

/** Returns false if the user cancelled the Google sign-in flow. */
export async function signInWithGoogle(): Promise<boolean> {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (response.type !== 'success') return false;

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error('Google sign-in did not return an ID token.');
  }

  const credential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(credential);
  return true;
}

export async function signOut(): Promise<void> {
  await auth().signOut();
}

/**
 * GDPR right-to-erasure: deletes the user's Firestore data and Auth account
 * via the `deleteAccount` Cloud Function, then clears local follow state.
 */
export async function deleteAccount(): Promise<void> {
  const functionsInstance = getFunctions(getApp(), FUNCTIONS_REGION);
  const callDeleteAccount = httpsCallable(functionsInstance, 'deleteAccount');

  await callDeleteAccount();
  await clearAllFollows();
  await auth().signOut();
}
