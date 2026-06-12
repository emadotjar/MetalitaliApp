# Setup

One-time steps to provision the Firebase project and build the app. The repo
ships with placeholder IDs (`REPLACE_WITH_...`) that need to be swapped for
real values from your Firebase project.

## 1. Prerequisites

- Node 22, `npm install -g firebase-tools`
- A Google account for Firebase, and (for Apple Sign-In + iOS push) an Apple
  Developer account
- Xcode (iOS) and/or Android Studio (Android) — `@react-native-firebase`
  requires native builds, so this app cannot run in Expo Go

## 2. Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and
   create a new project.
2. **Upgrade to the Blaze (pay-as-you-go) plan.** Cloud Functions v2 and the
   Cloud Scheduler jobs used by `pollMetalitalia` and `refreshBandList`
   require it (Cloud Scheduler still has a small free tier, but the plan
   itself must be Blaze).
3. Create the Firestore database and set its location to **`eur3`
   (Europe, multi-region)**. This cannot be changed later — pick it
   carefully. Cloud Functions already deploy to `europe-west1` in code.

## 3. Connect the local project

```sh
firebase login
```

Edit `.firebaserc` and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with
your project's ID.

## 4. Register the iOS and Android apps

In the Firebase console (Project settings > Your apps):

- **iOS app** — bundle ID `com.metalitaliapp.app`. Download
  `GoogleService-Info.plist` and place it at `app/GoogleService-Info.plist`.
- **Android app** — package `com.metalitaliapp.app`. Download
  `google-services.json` and place it at `app/google-services.json`.

(Both files are gitignored — don't commit them.)

If you want a different bundle identifier / package name, change it
consistently in `app/app.json` (`ios.bundleIdentifier`, `android.package`)
*and* when registering the apps above.

## 5. Enable sign-in providers

In Firebase console > Authentication > Sign-in method, enable:

- **Google**
  - After enabling, copy the **Web client ID** (OAuth client type 3, also
    listed in `google-services.json`) and put it in
    `app/src/lib/auth.ts` as `GOOGLE_WEB_CLIENT_ID`.
  - Open `app/GoogleService-Info.plist`, copy the `REVERSED_CLIENT_ID`
    value, and put it in `app/app.json` under the
    `@react-native-google-signin/google-signin` plugin config
    (`iosUrlScheme`), replacing
    `com.googleusercontent.apps.REPLACE_WITH_IOS_OAUTH_CLIENT_ID`.
- **Apple**
  - In the [Apple Developer portal](https://developer.apple.com/account),
    add the "Sign in with Apple" capability to the `com.metalitaliapp.app`
    App ID. The `expo-apple-authentication` config plugin adds the required
    entitlement automatically when the app is built/prebuilt.
  - Just toggling "Apple" on in the Firebase console is sufficient for the
    native sign-in flow used here (no Services ID / private key needed).

## 6. Push notifications (FCM)

- **Android** works automatically once `google-services.json` is in place.
- **iOS** requires an APNs Auth Key: in the Apple Developer portal, go to
  Certificates, Identifiers & Profiles > Keys, create a key with the "Apple
  Push Notifications service (APNs)" capability, then upload the `.p8` file
  (with its Key ID and Team ID) to Firebase console > Project settings >
  Cloud Messaging > Apple app configuration.

## 7. Deploy the backend

```sh
cd functions
npm install
npm run build
cd ..
firebase deploy --only firestore:rules,functions
```

This deploys `pollMetalitalia` (every 30 min), `refreshBandList` (weekly),
and the `deleteAccount` / `seedBands` callables, all in `europe-west1`.

## 8. Seed the band catalog (one-time)

`seedBands` requires the caller to have the `admin: true` custom claim. Grant
it to your own account once, using a service account key:

1. Firebase console > Project settings > Service accounts > Generate new
   private key. Save it as e.g. `service-account.json` (don't commit it).
2. Run a one-off script (from the repo root, with `firebase-admin`
   available via `functions/node_modules`):

   ```sh
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node -e "
     const { initializeApp, credential } = require('./functions/node_modules/firebase-admin/app');
     const { getAuth } = require('./functions/node_modules/firebase-admin/auth');
     initializeApp({ credential: credential.applicationDefault() });
     getAuth().setCustomUserClaims('YOUR_FIREBASE_AUTH_UID', { admin: true })
       .then(() => console.log('done'));
   "
   ```

   (Get `YOUR_FIREBASE_AUTH_UID` by signing into the app once with the
   account you want to use as admin, then finding it in Firebase console >
   Authentication > Users.)
3. Sign out and back in on the device (so the new custom claim is picked up),
   then trigger the `seedBands` callable once — e.g. with a small script
   using `firebase-admin`'s `getFunctions()` or by adding a temporary button
   in the app. After this, `bands/` is populated and `refreshBandList` keeps
   it up to date weekly.
4. Optionally remove the custom claim afterwards (`{ admin: false }`) since
   it's only needed for this one-time seed.

## 9. Build and run the app

```sh
cd app
npm install
npx expo run:ios      # or: npx expo run:android
```

`npx expo start --web` also works for a quick UI preview, but
`@react-native-firebase/*` and Google/Apple sign-in have no web
implementation — those features are no-ops on web (band list stays empty,
account/notification status stays signed-out).

## 10. Publish the privacy policy

`PRIVACY.md` is the source of truth (mirrored in-app at `Settings > Privacy
policy`). Host its contents at a public URL and link to it from the App
Store / Play Store listings.
