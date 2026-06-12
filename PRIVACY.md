# Privacy Policy

_This is the source document for the privacy policy shown in-app
(`app/src/app/privacy.tsx`) and used for App Store / Play Store listings.
Keep both in sync._

## What we collect

- **If you don't sign in**: the app stores your followed bands locally on
  your device, plus a push-notification token used to deliver band updates.
  Nothing is sent to our servers.
- **If you sign in** (with Apple or Google): we additionally store your
  account ID and your followed-bands list on our servers, so they can be
  restored when you switch devices.

## Why we collect it

Solely to send push notifications when new content about a band you follow
is published on metalitalia.com, and to keep your follow list in sync across
devices.

## Where it's stored

All server-side data (Firestore, Cloud Functions) is hosted in EU regions.

## Your rights (GDPR)

- **Access/portability**: your followed-bands list is visible in the app at
  all times (My Bands tab).
- **Erasure**: Settings > Delete account permanently removes your stored
  followed-bands list and account ID, and deletes your authentication
  account. This is immediate and irreversible.
- **Withdrawing consent**: you can unfollow all bands and/or disable
  notification permissions at any time without deleting your account.

## Third parties

- **Firebase (Google)**: hosts our database, authentication, and push
  notification delivery (FCM), under Google's standard Data Processing
  Addendum for EU customers.
- **Apple / Google Sign-In**: used only to authenticate you; we receive an
  account identifier and, if you grant it, your email address.

## Contact

For privacy questions or data requests, contact the developer at the email
address listed on the app's store page.
