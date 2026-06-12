import { Platform } from 'react-native';

/**
 * `@react-native-firebase/*` modules have no web implementation — calling
 * them on web throws synchronously. Use this to short-circuit Firebase-backed
 * code on web rather than crashing the page during the web preview.
 */
export const isFirebaseSupported = Platform.OS !== 'web';
