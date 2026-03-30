export type SlackPostResult = { ok: true } | { ok: false; error: string };

export async function postSlackIncomingWebhook(webhookUrl: string, text: string): Promise<SlackPostResult> {
  const trimmed = webhookUrl.trim();
  if (!trimmed.startsWith("https://hooks.slack.com/")) {
    return { ok: false, error: "Slack webhook URL must start with https://hooks.slack.com/" };
  }
  const body = JSON.stringify({ text: text.slice(0, 39_000) });

  const res = await fetch(trimmed, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const raw = await res.text();
  if (!res.ok) {
    return { ok: false, error: `Slack webhook HTTP ${res.status}: ${raw.slice(0, 200)}` };
  }
  if (raw !== "ok") {
    return { ok: false, error: `Slack unexpected response: ${raw.slice(0, 200)}` };
  }
  return { ok: true };
}
