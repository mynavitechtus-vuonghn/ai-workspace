import { NextResponse } from "next/server";

import { postSlackIncomingWebhook } from "@/lib/integrations/slack-webhook";

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

/**
 * POST /api/cron/slack
 *
 * Body JSON:
 * - message: string (required)
 * - qa?: boolean (optional) -> if true, uses SLACK_QA_WEBHOOK_URL; otherwise uses SLACK_WEBHOOK_URL
 *
 * Auth:
 * - Authorization: Bearer CRON_SECRET
 *   OR
 * - ?secret=CRON_SECRET
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Expected application/json body" }, { status: 400 });
  }

  const body = (await request.json()) as { message?: unknown; qa?: unknown };
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const qa = Boolean(body?.qa);

  if (!message) {
    return NextResponse.json({ error: "Missing field: message" }, { status: 400 });
  }

  const webhookUrl = qa
    ? process.env.SLACK_QA_WEBHOOK_URL?.trim()
    : process.env.SLACK_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return NextResponse.json(
      { error: qa ? "Missing SLACK_QA_WEBHOOK_URL" : "Missing SLACK_WEBHOOK_URL" },
      { status: 500 },
    );
  }

  const posted = await postSlackIncomingWebhook(webhookUrl, message);
  if (!posted.ok) {
    return NextResponse.json({ error: posted.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

