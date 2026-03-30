const GH_API = "https://api.github.com";

type GitHubUser = { login: string };

type SearchIssueItem = {
  title: string;
  html_url: string;
  number: number;
  draft?: boolean;
  repository_url?: string;
  user: { login: string } | null;
  pull_request?: { url?: string } | null;
};

export type SimpleGitHubRepo = {
  full_name: string;
  html_url: string;
  private: boolean;
};

export type SimplePullRequest = {
  title: string;
  url: string;
  number: number;
  repo: string;
  author: string;
  draft: boolean;
};

function splitFullName(full_name: string): { owner: string; repo: string } | null {
  const m = /^([^/]+)\/([^/]+)$/.exec(full_name.trim());
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

function repoFromRepositoryUrl(url: string | undefined): string {
  if (!url?.startsWith(`${GH_API}/repos/`)) {
    return "unknown/repo";
  }
  return url.slice(`${GH_API}/repos/`.length);
}

export function githubApiHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ai-dev-workspace",
  };
}

export async function fetchGitHubLogin(token: string): Promise<{ login: string } | { error: string }> {
  const res = await fetch(`${GH_API}/user`, { headers: githubApiHeaders(token) });
  if (!res.ok) {
    const body = await res.text();
    return { error: `GitHub /user failed (${res.status}): ${body.slice(0, 200)}` };
  }
  const data = (await res.json()) as GitHubUser;
  if (!data.login) {
    return { error: "GitHub response missing login" };
  }
  return { login: data.login };
}

/**
 * Open PRs where the user is involved (author, assignee, review request, comment, etc.).
 */
export async function fetchOpenPullRequestsInvolvingUser(
  token: string,
  login: string,
  max: number,
): Promise<{ pulls: SimplePullRequest[] } | { error: string }> {
  const perPage = Math.min(Math.max(max, 1), 25);
  const q = encodeURIComponent(`is:pr is:open involves:${login}`);
  const url = `${GH_API}/search/issues?q=${q}&per_page=${perPage}&sort=updated&order=desc`;

  const res = await fetch(url, { headers: githubApiHeaders(token) });
  if (!res.ok) {
    const body = await res.text();
    return { error: `GitHub search failed (${res.status}): ${body.slice(0, 300)}` };
  }

  const data = (await res.json()) as { items?: SearchIssueItem[] };
  const items = data.items ?? [];

  const pulls: SimplePullRequest[] = items
    .filter((it) => Boolean(it.pull_request))
    .map((it) => ({
      title: it.title,
      url: it.html_url,
      number: it.number,
      repo: repoFromRepositoryUrl(it.repository_url),
      author: it.user?.login ?? "?",
      draft: Boolean(it.draft),
    }));

  return { pulls };
}

export async function fetchUserRepositories(
  token: string,
  max: number,
): Promise<{ repos: SimpleGitHubRepo[] } | { error: string }> {
  const perPage = Math.min(Math.max(max, 1), 100);
  const url = `${GH_API}/user/repos?per_page=${perPage}&type=owner&sort=updated&direction=desc`;
  const res = await fetch(url, { headers: githubApiHeaders(token) });
  if (!res.ok) {
    const body = await res.text();
    return { error: `GitHub repos failed (${res.status}): ${body.slice(0, 300)}` };
  }
  const data = (await res.json()) as Array<{
    full_name?: string;
    html_url?: string;
    private?: boolean;
  }>;

  const repos: SimpleGitHubRepo[] = data
    .filter((r) => Boolean(r.full_name && r.html_url))
    .slice(0, max)
    .map((r) => ({
      full_name: r.full_name as string,
      html_url: r.html_url as string,
      private: Boolean(r.private),
    }));
  return { repos };
}

/**
 * Open PRs (not merged yet) where `login` is the author.
 * Drafts are filtered out by default.
 */
export async function fetchOpenPullRequestsByAuthor(
  token: string,
  login: string,
  max: number,
  opts?: { includeDrafts?: boolean },
): Promise<{ pulls: SimplePullRequest[] } | { error: string }> {
  const perPage = Math.min(Math.max(max, 1), 25);
  const includeDrafts = opts?.includeDrafts ?? false;

  const draftQuery = includeDrafts ? "" : "-draft:true";
  const q = encodeURIComponent(`is:pr is:open author:${login}${draftQuery}`);
  const url = `${GH_API}/search/issues?q=${q}&per_page=${perPage}&sort=updated&order=desc`;

  const res = await fetch(url, { headers: githubApiHeaders(token) });
  if (!res.ok) {
    const body = await res.text();
    return { error: `GitHub search failed (${res.status}): ${body.slice(0, 300)}` };
  }

  const data = (await res.json()) as { items?: SearchIssueItem[] };
  const items = data.items ?? [];

  const pulls: SimplePullRequest[] = items
    .filter((it) => Boolean(it.pull_request))
    .map((it) => ({
      title: it.title,
      url: it.html_url,
      number: it.number,
      repo: repoFromRepositoryUrl(it.repository_url),
      author: it.user?.login ?? login,
      draft: Boolean(it.draft),
    }))
    .filter((p) => includeDrafts || !p.draft);

  return { pulls };
}

async function fetchOpenPullsForRepoByAuthor(
  token: string,
  login: string,
  owner: string,
  repo: string,
  opts?: { includeDrafts?: boolean; pageSize?: number; maxPages?: number; maxPerRepo?: number },
): Promise<{ pulls: SimplePullRequest[] } | { error: string }> {
  const includeDrafts = opts?.includeDrafts ?? false;
  const pageSize = Math.min(Math.max(opts?.pageSize ?? 50, 1), 100);
  const maxPages = opts?.maxPages ?? 5;
  const maxPerRepo = opts?.maxPerRepo ?? 50;

  const pulls: SimplePullRequest[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${GH_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo,
    )}/pulls?state=open&per_page=${pageSize}&page=${page}`;

    const res = await fetch(url, { headers: githubApiHeaders(token) });
    if (!res.ok) {
      const body = await res.text();
      return { error: `GitHub pulls failed (${owner}/${repo}) (${res.status}): ${body.slice(0, 200)}` };
    }

    const batch = (await res.json()) as Array<{
      number: number;
      title: string;
      html_url: string;
      draft?: boolean;
      user?: { login?: string | null } | null;
    }>;

    if (batch.length === 0) break;

    for (const pr of batch) {
      if (!includeDrafts && pr.draft) continue;
      if ((pr.user?.login ?? "") !== login) continue;

      pulls.push({
        title: pr.title,
        url: pr.html_url,
        number: pr.number,
        repo: `${owner}/${repo}`,
        author: pr.user?.login ?? login,
        draft: Boolean(pr.draft),
      });
      if (pulls.length >= maxPerRepo) break;
    }

    if (pulls.length >= maxPerRepo) break;
    if (batch.length < pageSize) break;
  }

  return { pulls };
}

/**
 * Avoid GitHub Search API (can return 422 for `author:<user>` with some tokens).
 * Instead: list open PRs per repo and filter locally by author login.
 */
export async function fetchOpenPullRequestsByAuthorInRepos(
  token: string,
  login: string,
  repos: SimpleGitHubRepo[],
  opts?: { includeDrafts?: boolean; pageSize?: number; maxPagesPerRepo?: number; maxPerRepo?: number; maxTotal?: number },
): Promise<{ pulls: SimplePullRequest[] } | { error: string }> {
  const pulls: SimplePullRequest[] = [];
  const maxTotal = opts?.maxTotal ?? 200;

  for (const r of repos) {
    const split = splitFullName(r.full_name);
    if (!split) continue;

    const res = await fetchOpenPullsForRepoByAuthor(token, login, split.owner, split.repo, {
      includeDrafts: opts?.includeDrafts ?? false,
      pageSize: opts?.pageSize ?? 50,
      maxPages: opts?.maxPagesPerRepo ?? 5,
      maxPerRepo: opts?.maxPerRepo ?? 50,
    });

    if ("error" in res) return res;
    pulls.push(...res.pulls);
    if (pulls.length >= maxTotal) break;
  }

  return { pulls: pulls.slice(0, maxTotal) };
}
