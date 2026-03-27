import { Worker } from "bullmq";
import { redis } from "@/lib/redis";

export const notificationWorker = new Worker(
  "notification-jobs",
  async (job) => {
    return { ok: true, message: "Notification processed", payload: job.data };
  },
  { connection: redis },
);
