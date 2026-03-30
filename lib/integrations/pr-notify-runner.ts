import {
  extractBacklogIssueKeys,
  backlogIssueViewUrl,
  fetchBacklogIssueSummary,
} from "@/lib/integrations/backlog-links";
import {
  fetchUnreviewedOpenPullRequests,
  parseRepoList,
  type UnreviewedPull,
} from "@/lib/integrations/unreviewed-prs";
import { postSlackIncomingWebhook } from "@/lib/integrations/slack-webhook";

function githubTokenFromEnv(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

/** PR / QA alerts only — không dùng SLACK_WEBHOOK_URL chung. */
export function slackQaWebhookFromEnv(): string | null {
  return process.env.SLACK_QA_WEBHOOK_URL?.trim() || null;
}

function watchReposFromEnv(): string {
  return process.env.GITHUB_WATCH_REPOS?.trim() || "";
}

function backlogFromEnv(): { space: string | null; apiKey: string | null } {
  return {
    space: process.env.BACKLOG_SPACE?.trim() || null,
    apiKey: process.env.BACKLOG_API_KEY?.trim() || null,
  };
}

async function formatPrLine(pr: UnreviewedPull, space: string | null, apiKey: string | null): Promise<string> {
  const keys = extractBacklogIssueKeys(pr.titleAndBody);
  let backlogLines = "";
  if (keys.length && space) {
    for (const key of keys.slice(0, 5)) {
      const url = backlogIssueViewUrl(space, key);
      let extra = "";
      if (apiKey) {
        const sum = await fetchBacklogIssueSummary(space, apiKey, key);
        if (sum) extra = ` — ${sum}`;
      }
      backlogLines += `\n    • Backlog ${key}${extra}: ${url}`;
    }
  } else if (keys.length) {
    backlogLines = `\n    • Keys: ${keys.join(", ")} (set BACKLOG_SPACE in .env to link)`;
  }
  return `• *${pr.owner}/${pr.repo}#${pr.number}* — ${pr.title}\n  Author: \`${pr.author}\`\n  ${pr.url}${backlogLines}`;
}

export type UnreviewedNotifyResult =
  | { ok: true; skipped: true; reason: string }
  | { ok: true; sent: true; pullCount: number }
  | { ok: false; error: string };

export async function runUnreviewedPrSlackQaNotification(
  options?: { skipIfEmpty?: boolean },
): Promise<UnreviewedNotifyResult> {
  const skipIfEmpty = options?.skipIfEmpty ?? true;
  const token = githubTokenFromEnv();
  const qaWebhook = slackQaWebhookFromEnv();
  const repos = parseRepoList(watchReposFromEnv());
  const { space, apiKey } = backlogFromEnv();

  if (!token) {
    return { ok: false, error: "Missing GITHUB_TOKEN in environment." };
  }
  if (!qaWebhook) {
    return { ok: false, error: "Missing SLACK_QA_WEBHOOK_URL in environment." };
  }
  if (repos.length === 0) {
    return { ok: false, error: "No repos to watch. Set GITHUB_WATCH_REPOS (comma or newline separated owner/repo)." };
  }

  const result = await fetchUnreviewedOpenPullRequests(token, repos);
  if ("error" in result) {
    return { ok: false, error: result.error };
  }

  if (result.pulls.length === 0 && skipIfEmpty) {
    return { ok: true, skipped: true, reason: "No open PRs without reviews." };
  }

  const lines = await Promise.all(result.pulls.map((pr) => formatPrLine(pr, space, apiKey)));
  const text = [
    "*[QA]* PR mở *chưa có review* trên GitHub",
    "",
    ...lines,
    "",
    `_Repos: ${repos.map((r) => `${r.owner}/${r.repo}`).join(", ")}_`,
  ].join("\n");

  const posted = await postSlackIncomingWebhook(qaWebhook, text);
  if (!posted.ok) {
    return { ok: false, error: posted.error };
  }
  return { ok: true, sent: true, pullCount: result.pulls.length };
}
