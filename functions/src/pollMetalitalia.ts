import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { db, messaging } from "./admin.js";
import { matchBands } from "./bandMatcher.js";
import { getAllBands } from "./bandsRepo.js";
import { fetchRecentPosts } from "./metalitalia.js";

const REGION = "europe-west1";
const POLL_STATE_REF = db.collection("meta").doc("pollState");

/**
 * Polls metalitalia.com for newly published posts, matches each new post's
 * title against the known band catalog, and notifies the corresponding
 * `band-<slug>` FCM topics.
 */
export const pollMetalitalia = onSchedule(
  { schedule: "every 30 minutes", region: REGION, timeZone: "Europe/Rome" },
  async () => {
    const [posts, bands, stateSnap] = await Promise.all([
      fetchRecentPosts(20),
      getAllBands(),
      POLL_STATE_REF.get(),
    ]);

    if (posts.length === 0) {
      logger.info("No posts returned from metalitalia.com.");
      return;
    }

    const maxId = Math.max(...posts.map((post) => post.id));

    if (!stateSnap.exists) {
      // First run: establish a baseline without notifying for historical posts.
      await POLL_STATE_REF.set({ lastSeenPostId: maxId, lastCheckedAt: new Date() });
      logger.info(`Initialized poll state baseline at post ${maxId}.`);
      return;
    }

    const lastSeenPostId = (stateSnap.data()?.lastSeenPostId as number) ?? 0;
    const newPosts = posts
      .filter((post) => post.id > lastSeenPostId)
      .sort((a, b) => a.id - b.id);

    if (newPosts.length === 0) {
      logger.info("No new posts since last poll.");
      return;
    }

    for (const post of newPosts) {
      const matches = matchBands(post.title, bands);
      for (const band of matches) {
        await messaging.send({
          topic: `band-${band.slug}`,
          notification: {
            title: band.name,
            body: post.title,
          },
          data: { url: post.link, slug: band.slug },
        });
        logger.info(`Notified band-${band.slug} for post ${post.id} (${post.title})`);
      }
    }

    await POLL_STATE_REF.set({ lastSeenPostId: maxId, lastCheckedAt: new Date() }, { merge: true });
  },
);
