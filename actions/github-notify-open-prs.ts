"use server";

import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { runOpenPrsToSlackNotification } from "@/lib/integrations/open-prs-slack";

/**
 * Force post open (not merged) PRs (author filtered) to Slack via SLACK_WEBHOOK_URL.
 */
export async function notifyOpenPrsToSlackNow() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await runOpenPrsToSlackNotification({ skipIfEmpty: false });

  revalidatePath("/github");
  revalidatePath("/slack");

  return result;
}

