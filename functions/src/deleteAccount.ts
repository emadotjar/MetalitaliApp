import { logger } from "firebase-functions";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { auth, db } from "./admin.js";

const REGION = "europe-west1";

/**
 * Callable used by the app's "Delete my account" action (GDPR
 * right-to-erasure): removes the user's Firestore doc and their Firebase
 * Auth account.
 */
export const deleteAccount = onCall({ region: REGION }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "You must be signed in to delete your account.");
  }

  await db.collection("users").doc(uid).delete();
  await auth.deleteUser(uid);

  logger.info(`Deleted account for user ${uid}.`);
  return { success: true };
});
