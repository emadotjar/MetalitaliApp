import { logger } from "firebase-functions";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { upsertBands } from "./bandsRepo.js";
import { scrapeBandList } from "./metalitalia.js";

const REGION = "europe-west1";

/**
 * One-time/manual callable that scrapes the metalitalia.com band archive and
 * populates the `bands` collection. Restricted to callers with the `admin`
 * custom claim — see SETUP.md for how to grant it.
 */
export const seedBands = onCall({ region: REGION }, async (request) => {
  if (request.auth?.token.admin !== true) {
    throw new HttpsError("permission-denied", "Admin privileges required.");
  }

  const bands = await scrapeBandList();
  const written = await upsertBands(bands);
  logger.info(`Seeded ${written} bands.`);
  return { count: written };
});
