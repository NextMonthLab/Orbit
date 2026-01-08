import type { IStorage } from "../storage";
import { log } from "../index";
import { generateWeeklyPrompts, getCurrentWeekNumber } from "../services/knowledgeCoach";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function startWeeklyKnowledgeCoachJob(storage: IStorage) {
  async function runJob() {
    try {
      log("Running weekly Knowledge Coach generation", "knowledge-coach-job");
      
      const eligibleOrbits = await storage.getEligibleOrbitsForKnowledgeCoach();
      
      if (eligibleOrbits.length === 0) {
        log("No eligible orbits for Knowledge Coach", "knowledge-coach-job");
        return;
      }

      log(`Found ${eligibleOrbits.length} eligible orbit(s)`, "knowledge-coach-job");

      for (const orbit of eligibleOrbits) {
        try {
          const tier = orbit.planTier as 'grow' | 'intelligence';
          
          const pendingCount = await storage.getPendingKnowledgePromptsCount(orbit.businessSlug!);
          const maxQuestions = tier === 'intelligence' ? 5 : 3;
          
          if (pendingCount >= maxQuestions) {
            log(`Orbit ${orbit.businessSlug} already has ${pendingCount} pending prompts (max: ${maxQuestions})`, "knowledge-coach-job");
            continue;
          }
          
          await generateWeeklyPrompts(orbit.businessSlug!, tier);
          log(`Generated prompts for ${orbit.businessSlug}`, "knowledge-coach-job");
        } catch (err) {
          log(`Error generating prompts for ${orbit.businessSlug}: ${err}`, "knowledge-coach-job");
        }
      }
      
      log("Weekly Knowledge Coach job completed", "knowledge-coach-job");
    } catch (error) {
      log(`Error in Knowledge Coach job: ${error}`, "knowledge-coach-job");
    }
  }

  // Run after a short delay on startup to ensure storage is initialized
  setTimeout(() => {
    runJob();
  }, 5000);
  
  // Then run weekly
  setInterval(runJob, WEEK_MS);
  log("Started weekly Knowledge Coach job (runs every 7 days)", "knowledge-coach-job");
}
