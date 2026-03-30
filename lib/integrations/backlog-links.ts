/** Typical Backlog keys: PROJECT-123, ABC_1-42 */
const KEY_RE = /\b[A-Z][A-Z0-9_]+-\d+\b/g;

export function extractBacklogIssueKeys(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of text.matchAll(KEY_RE)) {
    const k = m[0];
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
}

/** `spaceOrHost`: subdomain `myteam` → https://myteam.backlog.com ; or full host `myteam.backlog.jp`. */
export function backlogBaseUrl(spaceOrHost: string): string {
  const s = spaceOrHost.trim();
  if (!s) return "";
  const noProto = s.replace(/^https?:\/\//, "");
  if (noProto.includes(".")) {
    return `https://${noProto}`;
  }
  return `https://${noProto}.backlog.com`;
}

export function backlogIssueViewUrl(spaceOrHost: string, issueKey: string): string {
  const base = backlogBaseUrl(spaceOrHost);
  return `${base}/view/${encodeURIComponent(issueKey)}`;
}

type BacklogIssue = {
  summary?: string;
  issueKey?: string;
};

/** Optional: enrich Slack line with issue summary from Backlog API v2. */
export async function fetchBacklogIssueSummary(
  spaceOrHost: string,
  apiKey: string,
  issueKey: string,
): Promise<string | null> {
  const origin = backlogBaseUrl(spaceOrHost);
  const path = `/api/v2/issues/${encodeURIComponent(issueKey)}`;
  const url = `${origin}${path}?apiKey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { headers: { "User-Agent": "ai-dev-workspace" } });
  if (!res.ok) return null;
  const data = (await res.json()) as BacklogIssue;
  return data.summary?.trim() || data.issueKey || null;
}
