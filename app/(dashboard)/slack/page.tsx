import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PrNotifyQaButton } from "@/components/settings/pr-notify-qa-button";
import { ConfigStatusPill } from "@/components/settings/config-status-pill";
import { authOptions } from "@/lib/auth";
import { getPublicEnvStatus } from "@/lib/settings/env-status";

export default async function SlackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const env = getPublicEnvStatus();

  return (
    <div className="space-y-10">
      <header className="space-y-1 border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Slack</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Slack QA &amp; PR alerts</h1>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          Gửi thông báo PR mở chưa có review đến kênh Slack QA (Incoming Webhook riêng).
        </p>
      </header>

      <section className="space-y-4" aria-labelledby="slack-env-heading">
        <h2 id="slack-env-heading" className="text-lg font-semibold tracking-tight">
          Env status
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card size="sm">
            <CardHeader>
              <CardTitle>SLACK_WEBHOOK_URL</CardTitle>
              <CardDescription>notifySlack tool cho AI Chat</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigStatusPill ok={env.slackWebhookUrl} />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>SLACK_QA_WEBHOOK_URL</CardTitle>
              <CardDescription>Slack QA (PR chưa review)</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigStatusPill ok={env.slackQaWebhookUrl} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>GITHUB_WATCH_REPOS</CardTitle>
              <CardDescription>Danh sách owner/repo cần quét</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigStatusPill ok={env.githubWatchRepos} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>CRON_SECRET</CardTitle>
              <CardDescription>Bảo vệ cron endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigStatusPill ok={env.cronSecret} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="slack-qa-heading">
        <h2 id="slack-qa-heading" className="text-lg font-semibold tracking-tight">
          Gửi thử → Slack QA
        </h2>
        <Card size="sm">
          <CardHeader>
            <CardTitle>PR mở chưa có review</CardTitle>
            <CardDescription>
              Hệ thống sẽ quét repo trong <code className="text-xs">GITHUB_WATCH_REPOS</code>, tìm PR open chưa
              có submitted reviews và post vào <code className="text-xs">SLACK_QA_WEBHOOK_URL</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrNotifyQaButton />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

