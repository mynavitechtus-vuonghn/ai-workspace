"use server";

import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const googleAiKeySchema = z.string().min(1).max(10_000);

export async function saveGoogleGenerativeAiApiKey(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const raw = formData.get("googleGenerativeAiApiKey");
  if (typeof raw !== "string") {
    return;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    revalidatePath("/settings");
    return;
  }

  const key = googleAiKeySchema.parse(trimmed);

  await db.userSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      googleGenerativeAiApiKey: key,
    },
    update: {
      googleGenerativeAiApiKey: key,
    },
  });

  revalidatePath("/settings");
}

export async function clearGoogleGenerativeAiApiKeyOverride() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, googleGenerativeAiApiKey: null },
    update: { googleGenerativeAiApiKey: null },
  });

  revalidatePath("/settings");
}

const patSchema = z.string().min(1).max(20_000);
const slackWebhookSchema = z.string().url().max(2048);

export async function saveGithubToken(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const raw = formData.get("githubToken");
  if (typeof raw !== "string") return;
  const trimmed = raw.trim();
  if (!trimmed) {
    revalidatePath("/settings");
    return;
  }

  const token = patSchema.parse(trimmed);
  await db.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, githubToken: token },
    update: { githubToken: token },
  });
  revalidatePath("/settings");
}

export async function clearGithubTokenOverride() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, githubToken: null },
    update: { githubToken: null },
  });
  revalidatePath("/settings");
}

export async function saveSlackWebhookUrl(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const raw = formData.get("slackWebhookUrl");
  if (typeof raw !== "string") return;
  const trimmed = raw.trim();
  if (!trimmed) {
    revalidatePath("/settings");
    return;
  }

  const url = slackWebhookSchema.parse(trimmed);
  if (!url.startsWith("https://hooks.slack.com/")) {
    throw new Error("Slack Incoming Webhook must use https://hooks.slack.com/…");
  }

  await db.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, slackWebhookUrl: url },
    update: { slackWebhookUrl: url },
  });
  revalidatePath("/settings");
}

export async function clearSlackWebhookOverride() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, slackWebhookUrl: null },
    update: { slackWebhookUrl: null },
  });
  revalidatePath("/settings");
}
