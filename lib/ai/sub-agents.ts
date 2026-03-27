import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const workflowQueue = new Queue("workflow-jobs", {
  connection: redis,
});

type DailyBriefingPayload = {
  userId: string;
  runAt?: string;
};

export async function enqueueDailyBriefing(payload: DailyBriefingPayload) {
  return workflowQueue.add("daily-briefing", payload, {
    attempts: 3,
    removeOnComplete: 50,
    removeOnFail: 50,
  });
}
