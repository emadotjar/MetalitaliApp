import { FieldValue } from "firebase-admin/firestore";

import { db } from "./admin.js";
import type { ScrapedBand } from "./metalitalia.js";
import type { BandDoc } from "./bandMatcher.js";

const BATCH_SIZE = 500;

/**
 * Upsert scraped bands into the `bands` collection, chunked into batches
 * of 500 writes (Firestore's batch limit).
 */
export async function upsertBands(bands: ScrapedBand[]): Promise<number> {
  let written = 0;

  for (let i = 0; i < bands.length; i += BATCH_SIZE) {
    const chunk = bands.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const band of chunk) {
      const ref = db.collection("bands").doc(band.slug);
      batch.set(
        ref,
        {
          name: band.name,
          slug: band.slug,
          nameLower: band.name.toLowerCase(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    await batch.commit();
    written += chunk.length;
  }

  return written;
}

/** Fetch the full band catalog (just the fields needed for title matching). */
export async function getAllBands(): Promise<BandDoc[]> {
  const snapshot = await db.collection("bands").select("name", "slug").get();
  return snapshot.docs.map((doc) => doc.data() as BandDoc);
}
