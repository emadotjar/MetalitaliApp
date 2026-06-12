import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { upsertBands } from "./bandsRepo.js";
import { scrapeBandList } from "./metalitalia.js";

const REGION = "europe-west1";

/** Weekly re-scrape of the band archive to pick up newly added bands. */
export const refreshBandList = onSchedule(
  { schedule: "every monday 04:00", region: REGION, timeZone: "Europe/Rome" },
  async () => {
    const bands = await scrapeBandList();
    const written = await upsertBands(bands);
    logger.info(`Refreshed band list: ${written} bands upserted.`);
  },
);
