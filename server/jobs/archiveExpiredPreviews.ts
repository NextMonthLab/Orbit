import type { IStorage } from "../storage";
import { log } from "../index";

/**
 * Runs a background job to archive expired preview instances.
 * Runs every hour and archives any previews that have passed their expiresAt timestamp.
 */
export function startArchiveExpiredPreviewsJob(storage: IStorage) {
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  async function runJob() {
    try {
      const expiredPreviews = await storage.getExpiredPreviews();

      if (expiredPreviews.length > 0) {
        log(`Archiving ${expiredPreviews.length} expired preview(s)`, "archive-job");

        for (const preview of expiredPreviews) {
          await storage.archivePreviewInstance(preview.id);
          log(`Archived preview ${preview.id} (${preview.sourceDomain})`, "archive-job");
        }
      }
    } catch (error) {
      log(`Error in archive job: ${error}`, "archive-job");
    }
  }

  // Run immediately on startup
  runJob();

  // Then run every hour
  setInterval(runJob, INTERVAL_MS);

  log("Started archive expired previews job (runs every 1 hour)", "archive-job");
}
