import { NextResponse } from "next/server";

import { runUnreviewedPrSlackQaNotification } from "@/lib/integrations/pr-notify-runner";

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

/**
 * POST /api/cron/unreviewed-prs
 * Header: Authorization: Bearer CRON_SECRET
 * Or: ?secret=CRON_SECRET
 *
 * Env: GITHUB_TOKEN, SLACK_QA_WEBHOOK_URL, GITHUB_WATCH_REPOS, optional BACKLOG_*.
 * Header x-notify-empty: 1 → gửi cả khi không có PR.
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const empty = request.headers.get("x-notify-empty") === "1";
  const skipIfEmpty = !empty;

  const result = await runUnreviewedPrSlackQaNotification({ skipIfEmpty });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  if ("skipped" in result && result.skipped) {
    return NextResponse.json({ ok: true, skipped: true, reason: result.reason });
  }
  if ("sent" in result && result.sent) {
    return NextResponse.json({ ok: true, sent: true, pullCount: result.pullCount });
  }
  return NextResponse.json({ ok: false, error: "Unexpected result" }, { status: 500 });
}
