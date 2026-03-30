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

export type SimplePullRequest = {
  title: string;
  url: string;
  number: number;
  repo: string;
  author: string;
  draft: boolean;
};

function repoFromRepositoryUrl(url: string | undefined): string {
  if (!url?.startsWith(`${GH_API}/repos/`)) {
    return "unknown/repo";
  }
  return url.slice(`${GH_API}/repos/`.length);
}

function headers(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ai-dev-workspace",
  };
}

export async function fetchGitHubLogin(token: string): Promise<{ login: string } | { error: string }> {
  const res = await fetch(`${GH_API}/user`, { headers: headers(token) });
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

  const res = await fetch(url, { headers: headers(token) });
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
