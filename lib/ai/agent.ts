import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { UserSettings } from "@prisma/client";
import { stepCountIs, streamText, tool } from "ai";
import type { ModelMessage } from "ai";
import { z } from "zod";

import { DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini-defaults";
import { db } from "@/lib/db";
import { fetchGitHubLogin, fetchOpenPullRequestsInvolvingUser } from "@/lib/integrations/github-prs";
import { postSlackIncomingWebhook } from "@/lib/integrations/slack-webhook";

type ChatAgentInput = {
  userId: string;
  messages: ModelMessage[];
};

function resolveGoogleAiApiKey(userOverride: string | null | undefined) {
  const fromUser = userOverride?.trim();
  const fromEnv = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  return fromUser || fromEnv || null;
}

function resolveGithubToken(userSettings: UserSettings | null) {
  return userSettings?.githubToken?.trim() || process.env.GITHUB_TOKEN?.trim() || null;
}

function resolveSlackWebhookUrl(userSettings: UserSettings | null) {
  return userSettings?.slackWebhookUrl?.trim() || process.env.SLACK_WEBHOOK_URL?.trim() || null;
}

function resolveModelId() {
  return process.env.AI_MODEL_ID?.trim() || DEFAULT_GEMINI_MODEL;
}

export async function runChatAgent({ userId, messages }: ChatAgentInput) {
  const [tasks, userSettings] = await Promise.all([
    db.task.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 40,
    }),
    db.userSettings.findUnique({ where: { userId } }),
  ]);

  const apiKey = resolveGoogleAiApiKey(userSettings?.googleGenerativeAiApiKey);
  if (!apiKey) {
    throw new Error(
      "Missing Google AI API key. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local or save a key in Settings (Gemini — free tier at aistudio.google.com).",
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const modelId = resolveModelId();
  const githubToken = resolveGithubToken(userSettings);
  const slackWebhook = resolveSlackWebhookUrl(userSettings);

  return streamText({
    model: google(modelId),
    system: `You are an AI productivity assistant.
You can summarize work, plan tasks, and create tasks via the createTask tool when the user asks.
You can list the user's open GitHub pull requests (where they are involved) via listMyOpenGithubPullRequests — use it when they ask about PRs, reviews, or GitHub work.
You can send a short message to their Slack channel via notifySlack — use it when they explicitly want Slack notified (e.g. summary of PRs). Format messages clearly; use bullet lines if listing PRs.
Current user id: ${userId}.
GitHub token configured: ${githubToken ? "yes" : "no"}.
Slack webhook configured: ${slackWebhook ? "yes" : "no"}.
Existing tasks (JSON): ${JSON.stringify(tasks)}`,
    messages,
    stopWhen: stepCountIs(12),
    tools: {
      createTask: tool({
        description: "Create a new task for this user",
        inputSchema: z.object({
          title: z.string().min(1),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
          description: z.string().optional(),
        }),
        execute: async (input) => {
          return db.task.create({
            data: {
              title: input.title,
              priority: input.priority,
              description: input.description,
              userId,
            },
          });
        },
      }),
      listMyOpenGithubPullRequests: tool({
        description:
          "List open GitHub pull requests involving this user (author, assignee, reviewer, etc.). Requires GitHub token in Settings or GITHUB_TOKEN env.",
        inputSchema: z.object({
          limit: z.number().int().min(1).max(25).optional().default(10),
        }),
        execute: async ({ limit }) => {
          const token = githubToken;
          if (!token) {
            return {
              error:
                "No GitHub token. Add a Personal Access Token in Settings → Integrations or set GITHUB_TOKEN in .env.local (scope: repo, read:org if needed).",
            };
          }
          const loginResult = await fetchGitHubLogin(token);
          if ("error" in loginResult) {
            return { error: loginResult.error };
          }
          const prResult = await fetchOpenPullRequestsInvolvingUser(token, loginResult.login, limit ?? 10);
          if ("error" in prResult) {
            return { error: prResult.error };
          }
          return {
            githubLogin: loginResult.login,
            count: prResult.pulls.length,
            pullRequests: prResult.pulls,
          };
        },
      }),
      notifySlack: tool({
        description:
          "Post a plain-text message to Slack via Incoming Webhook. Use when the user wants updates pushed to Slack.",
        inputSchema: z.object({
          message: z.string().min(1).max(15_000),
        }),
        execute: async ({ message }) => {
          const url = slackWebhook;
          if (!url) {
            return {
              error:
                "No Slack webhook. Add URL in Settings → Integrations or set SLACK_WEBHOOK_URL in .env.local (Incoming Webhook from api.slack.com).",
            };
          }
          const result = await postSlackIncomingWebhook(url, message);
          if (!result.ok) {
            return { error: result.error };
          }
          return { ok: true, note: "Message posted to Slack." };
        },
      }),
    },
  });
}
