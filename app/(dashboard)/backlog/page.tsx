import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { ConfigStatusPill } from "@/components/settings/config-status-pill";
import { getPublicEnvStatus } from "@/lib/settings/env-status";

export default async function BacklogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const env = getPublicEnvStatus();

  return (
    <div className="space-y-10">
      <header className="space-y-1 border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Backlog</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Linking config &amp; hints
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          Trong Slack QA message, hệ thống sẽ tự trích các key kiểu <code className="text-xs">ABC-123</code>{" "}
          từ title/body PR và tạo link tới Backlog.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Environment</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card size="sm">
            <CardHeader>
              <CardTitle>BACKLOG_SPACE</CardTitle>
              <CardDescription>Subdomain/host (vd: myteam)</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigStatusPill ok={env.backlogSpace} />
              <p className="mt-2 text-xs text-muted-foreground">
                Nếu đặt, Slack QA sẽ có link issue Backlog.
              </p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>BACKLOG_API_KEY</CardTitle>
              <CardDescription>Optional — enrich summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                (Optional) Nếu bạn set thêm <code className="text-xs">BACKLOG_API_KEY</code>, tin nhắn QA sẽ có tóm tắt
                issue (nếu API v2 hỗ trợ).
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
        <Card size="sm">
          <CardContent className="space-y-2 pt-6">
            <p className="text-sm text-muted-foreground">
              1. PR title/body có key dạng <code className="text-xs">ABC-123</code>.
            </p>
            <p className="text-sm text-muted-foreground">
              2. Bot trích tối đa 5 key mỗi PR.
            </p>
            <p className="text-sm text-muted-foreground">
              3. Tạo link về Backlog theo format: <code className="text-xs">/view/KEY</code>.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

