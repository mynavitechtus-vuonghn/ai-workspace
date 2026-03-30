import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { PrNotifyQaButton } from "@/components/settings/pr-notify-qa-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { NotifyOpenPrsToSlackButton } from "@/components/github/notify-open-prs-button";
import {
  fetchGitHubLogin,
  fetchUserRepositories,
  fetchOpenPullRequestsByAuthorInRepos,
  type SimplePullRequest,
} from "@/lib/integrations/github-prs";
import { cn } from "@/lib/utils";

export default async function GithubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const token = process.env.GITHUB_TOKEN?.trim() || null;

  let ghLogin: string | null = null;
  let repos: { full_name: string; html_url: string; private: boolean }[] = [];
  let openPrs: SimplePullRequest[] = [];
  let ghError: string | null = null;

  if (token) {
    const loginResult = await fetchGitHubLogin(token);
    if ("error" in loginResult) {
      ghError = loginResult.error;
    } else {
      ghLogin = loginResult.login;
      const reposResult = await fetchUserRepositories(token, 50);
      if ("error" in reposResult) {
        ghError = reposResult.error;
      } else {
        repos = reposResult.repos;
      }

      const prResult = await fetchOpenPullRequestsByAuthorInRepos(token, ghLogin, repos, { maxTotal: 120 });
      if ("error" in prResult) ghError = prResult.error;
      else openPrs = prResult.pulls;
    }
  } else {
    ghError = "Missing GITHUB_TOKEN in environment.";
  }

  const prsByRepo = openPrs.reduce<Record<string, SimplePullRequest[]>>((acc, pr) => {
    const key = pr.repo || "unknown/repo";
    if (!acc[key]) acc[key] = [];
    acc[key].push(pr);
    return acc;
  }, {});

  const repoPrRows = repos.map((r) => {
    const list = prsByRepo[r.full_name] ?? [];
    return { ...r, openPrCount: list.length, openPrs: list };
  });

  return (
    <div className="space-y-10">
      <header className="space-y-1 border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Integrations</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">GitHub</h1>
      </header>

      <section className="space-y-4" aria-labelledby="github-repos-prs-heading">
        <h2 id="github-repos-prs-heading" className="text-lg font-semibold tracking-tight">
          Repo &amp; PR mở chưa merge của bạn
        </h2>

        {ghError ? (
          <Card size="sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Không thể tải dữ liệu GitHub.</p>
              <p className="mt-2 text-xs font-mono text-amber-700 dark:text-amber-300">{ghError}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card size="sm">
              <CardHeader>
                <CardTitle>
                  {ghLogin ? `Đang đọc dữ liệu cho ${ghLogin}` : "Đang đọc dữ liệu GitHub"}
                </CardTitle>
                <CardDescription>
                  Danh sách repo (type=owner) + các PR open (author) — đã lọc draft.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {repoPrRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không có repo owner nào.</p>
                ) : (
                  repoPrRows.slice(0, 8).map((row) => (
                    <div key={row.full_name} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a
                            href={row.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline"
                          >
                            {row.full_name}
                          </a>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {row.openPrCount} PR open chưa merge
                          </p>
                        </div>
                        <span className={cn("inline-flex rounded-full bg-muted px-2 py-0.5 text-[0.65rem] ", row.private ? "bg-red-300" : "bg-green-300")}>
                          {row.private ? "private" : "public"}
                        </span>
                      </div>

                      {row.openPrs.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {row.openPrs.slice(0, 5).map((pr) => (
                            <li key={pr.number} className="text-sm">
                              <a
                                href={pr.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                #{pr.number} {pr.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">Chưa có PR open.</p>
                      )}
                    </div>
                  ))
                )}
                {repoPrRows.length > 8 ? (
                  <p className="text-xs text-muted-foreground">
                    Hiển thị 8 repo đầu tiên (để tránh quá dài). Có thể mở rộng sau.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="github-qa-heading">
        <h2 id="github-qa-heading" className="text-lg font-semibold tracking-tight">
          Gửi thử → Slack QA
        </h2>
        <Card size="sm">
          <CardHeader>
            <CardTitle>PR mở chưa có review</CardTitle>
            <CardDescription>
              Cần <code className="text-xs">GITHUB_TOKEN</code>, <code className="text-xs">SLACK_QA_WEBHOOK_URL</code>,{" "}
              <code className="text-xs">GITHUB_WATCH_REPOS</code>. Cron:{" "}
              <code className="text-xs">POST /api/cron/unreviewed-prs</code> với <code className="text-xs">CRON_SECRET</code>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrNotifyQaButton />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="github-open-heading">
        <h2 id="github-open-heading" className="text-lg font-semibold tracking-tight">
          Force gửi Slack → PR chưa merge
        </h2>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Gửi danh sách PR open (chưa merge)</CardTitle>
            <CardDescription>
              Lấy PR open (không merge) theo author từ GitHub và gửi vào <code className="text-xs">SLACK_WEBHOOK_URL</code>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotifyOpenPrsToSlackButton />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
