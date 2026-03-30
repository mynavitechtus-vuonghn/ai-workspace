import {
  fetchGitHubLogin,
  fetchUserRepositories,
  fetchOpenPullRequestsByAuthorInRepos,
  type SimplePullRequest,
} from "@/lib/integrations/github-prs";
import { postSlackIncomingWebhook } from "@/lib/integrations/slack-webhook";
import { backlogIssueViewUrl, extractBacklogIssueKeys } from "@/lib/integrations/backlog-links";

function githubTokenFromEnv(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

function slackWebhookFromEnv(): string | null {
  return process.env.SLACK_WEBHOOK_URL?.trim() || null;
}

function watchReposFromEnv(): string {
  return process.env.GITHUB_WATCH_REPOS?.trim() || "";
}

function parseRepoList(raw: string): { owner: string; repo: string }[] {
  const parts = raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const out: { owner: string; repo: string }[] = [];
  for (const p of parts) {
    const m = /^([^/]+)\/([^/]+)$/.exec(p);
    if (!m) continue;
    out.push({ owner: m[1], repo: m[2] });
  }
  return out;
}

function backlogConfigFromEnv(): { space: string | null } {
  const space = process.env.BACKLOG_SPACE?.trim() || null;
  return { space };
}

async function formatSlackPrLine(pr: SimplePullRequest, backlogSpace: string | null): Promise<string> {
  const keys = backlogSpace ? extractBacklogIssueKeys(`${pr.title} `) : [];
  let backlogLine = "";
  if (keys.length && backlogSpace) {
    const first = keys[0];
    backlogLine = `\n  Backlog: ${backlogIssueViewUrl(backlogSpace, first)}`;
  }
  return `• *${pr.repo}* #${pr.number}: ${pr.title}\n  ${pr.url}${backlogLine}`;
}

export type OpenPrsSlackResult =
  | { ok: true; sent: true; prCount: number }
  | { ok: false; error: string }
  | { ok: true; skipped: true; reason: string };

/**
 * Send open (not merged) PRs to SLACK_WEBHOOK_URL.
 * - PRs are filtered by "author" = authenticated GitHub login.
 * - Repo list is controlled by GITHUB_WATCH_REPOS.
 */
export async function runOpenPrsToSlackNotification(opts?: { skipIfEmpty?: boolean }) {
  const skipIfEmpty = opts?.skipIfEmpty ?? true;

  const token = githubTokenFromEnv();
  const slackWebhook = slackWebhookFromEnv();
  if (!token) return { ok: false, error: "Missing GITHUB_TOKEN in environment." };
  if (!slackWebhook) return { ok: false, error: "Missing SLACK_WEBHOOK_URL in environment." };

  const loginResult = await fetchGitHubLogin(token);
  if ("error" in loginResult) {
    return { ok: false, error: loginResult.error };
  }

  // If GITHUB_WATCH_REPOS is set, respect it; otherwise fall back to user's repos.
  const configuredReposRaw = watchReposFromEnv();
  const backlogConfig = backlogConfigFromEnv();

  let repos: Array<{ full_name: string; html_url: string; private: boolean }> = [];
  if (configuredReposRaw.length > 0) {
    repos = parseRepoList(configuredReposRaw).map((r) => ({
      full_name: `${r.owner}/${r.repo}`,
      html_url: `https://github.com/${r.owner}/${r.repo}`,
      private: false,
    }));
  }
  if (repos.length === 0) {
    const userRepos = await fetchUserRepositories(token, 50);
    if ("error" in userRepos) return { ok: false, error: userRepos.error };
    repos = userRepos.repos;
  }

  if (!repos || repos.length === 0) {
    return { ok: false, error: "No repos found. Set GITHUB_WATCH_REPOS or ensure token can access repos." };
  }

  const prResult = await fetchOpenPullRequestsByAuthorInRepos(token, loginResult.login, repos, {
    maxTotal: 200,
  });
  if ("error" in prResult) {
    return { ok: false, error: prResult.error };
  }

  if (prResult.pulls.length === 0 && skipIfEmpty) {
    return { ok: true, skipped: true, reason: "No open PRs not merged (author filtered)." };
  }

  const lines = await Promise.all(
    prResult.pulls.slice(0, 20).map((pr) => formatSlackPrLine(pr, backlogConfig.space)),
  );

  const text = [
    `*[GitHub]* PR chưa merge (author: ${loginResult.login})`,
    "",
    ...(lines.length > 0 ? lines : [`• Không tìm thấy PR open chưa merge nào.`]),
  ].join("\n");

  const posted = await postSlackIncomingWebhook(slackWebhook, text);
  if (!posted.ok) return { ok: false, error: posted.error };

  return { ok: true, sent: true, prCount: prResult.pulls.length };
}

