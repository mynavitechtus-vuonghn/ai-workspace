import { githubApiHeaders } from "@/lib/integrations/github-prs";

const GH_API = "https://api.github.com";

export type RepoSlug = { owner: string; repo: string };

export function parseRepoList(raw: string | null | undefined): RepoSlug[] {
  if (!raw?.trim()) return [];
  const parts = raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: RepoSlug[] = [];
  for (const p of parts) {
    const m = /^([^/]+)\/([^/]+)$/.exec(p);
    if (m) {
      out.push({ owner: m[1], repo: m[2] });
    }
  }
  return out;
}

type GhPull = {
  number: number;
  title: string;
  html_url: string;
  draft?: boolean;
  user: { login: string } | null;
  body: string | null;
};

export type UnreviewedPull = {
  owner: string;
  repo: string;
  number: number;
  title: string;
  url: string;
  author: string;
  titleAndBody: string;
};

async function fetchOpenPulls(
  token: string,
  owner: string,
  repo: string,
): Promise<GhPull[] | { error: string }> {
  const pulls: GhPull[] = [];
  let page = 1;
  const perPage = 50;
  while (page <= 5) {
    const url = `${GH_API}/repos/${owner}/${repo}/pulls?state=open&per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { headers: githubApiHeaders(token) });
    if (!res.ok) {
      const body = await res.text();
      return { error: `GitHub pulls ${owner}/${repo} (${res.status}): ${body.slice(0, 300)}` };
    }
    const batch = (await res.json()) as GhPull[];
    if (batch.length === 0) break;
    pulls.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  return pulls.filter((p) => !p.draft);
}

async function fetchReviewCount(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<number | { error: string }> {
  const url = `${GH_API}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews?per_page=100`;
  const res = await fetch(url, { headers: githubApiHeaders(token) });
  if (!res.ok) {
    const body = await res.text();
    return { error: `GitHub reviews (${res.status}): ${body.slice(0, 200)}` };
  }
  const reviews = (await res.json()) as unknown[];
  return reviews.length;
}

/** Open, non-draft PRs with zero submitted reviews on GitHub. */
export async function fetchUnreviewedOpenPullRequests(
  token: string,
  repos: RepoSlug[],
): Promise<{ pulls: UnreviewedPull[] } | { error: string }> {
  const pulls: UnreviewedPull[] = [];
  for (const { owner, repo } of repos) {
    const open = await fetchOpenPulls(token, owner, repo);
    if ("error" in open) return open;
    for (const pr of open) {
      const count = await fetchReviewCount(token, owner, repo, pr.number);
      if (typeof count === "object" && "error" in count) return count;
      if (count === 0) {
        const titleAndBody = `${pr.title}\n${pr.body ?? ""}`;
        pulls.push({
          owner,
          repo,
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          author: pr.user?.login ?? "?",
          titleAndBody,
        });
      }
    }
  }
  return { pulls };
}
