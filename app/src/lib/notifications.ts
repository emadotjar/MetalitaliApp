import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import { isFirebaseSupported } from './platform';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

function mapAuthorizationStatus(status: number): NotificationPermissionStatus {
  if (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  ) {
    return 'granted';
  }
  if (status === messaging.AuthorizationStatus.DENIED) {
    return 'denied';
  }
  return 'undetermined';
}

/** Android 13+ requires a separate runtime permission for notifications. */
function needsAndroidRuntimePermission(): boolean {
  return Platform.OS === 'android' && Number(Platform.Version) >= 33;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (!isFirebaseSupported) return 'undetermined';

  if (needsAndroidRuntimePermission()) {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted ? 'granted' : 'denied';
  }

  const status = await messaging().hasPermission();
  return mapAuthorizationStatus(status);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isFirebaseSupported) return 'undetermined';

  if (needsAndroidRuntimePermission()) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  }

  const status = await messaging().requestPermission();
  return mapAuthorizationStatus(status);
}
