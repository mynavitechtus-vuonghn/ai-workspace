"use server";

import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { runUnreviewedPrSlackQaNotification } from "@/lib/integrations/pr-notify-runner";

/** Gửi thông báo PR chưa review → Slack QA (chỉ env). */
export async function notifyUnreviewedPrsToSlackQaNow() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await runUnreviewedPrSlackQaNotification({ skipIfEmpty: false });
  revalidatePath("/github");
  revalidatePath("/slack");
  return result;
}
