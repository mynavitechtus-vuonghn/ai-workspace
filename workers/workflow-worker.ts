import { Worker } from "bullmq";
import { redis } from "@/lib/redis";

export const workflowWorker = new Worker(
  "workflow-jobs",
  async (job) => {
    if (job.name === "daily-briefing") {
      return { ok: true, message: "Daily briefing queued", payload: job.data };
    }

    return { ok: false, message: "Unknown job type" };
  },
  { connection: redis },
);
