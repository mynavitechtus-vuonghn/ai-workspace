import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { IntegrationsForm } from "@/components/settings/integrations-form";
import { GeminiKeyForm } from "@/components/settings/gemini-key-form";
import { ConfigStatusPill } from "@/components/settings/config-status-pill";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini-defaults";
import { getPublicEnvStatus } from "@/lib/settings/env-status";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userSettings = await db.userSettings.findUnique({ where: { userId: session.user.id } });
  const env = getPublicEnvStatus();

  const hasStoredOverride = Boolean(userSettings?.googleGenerativeAiApiKey?.trim());
  const hasEnvGemini = env.googleGenerativeAiApiKey;
  let effectiveSource: "env" | "settings" | "none" = "none";
  if (hasStoredOverride) {
    effectiveSource = "settings";
  } else if (hasEnvGemini) {
    effectiveSource = "env";
  }

  const defaultModelLabel = env.aiModelId || DEFAULT_GEMINI_MODEL;

  const rows: { label: string; hint: string; ok: boolean; code?: string }[] = [
    { label: "DATABASE_URL", hint: "PostgreSQL (Prisma)", ok: env.databaseUrl, code: "DATABASE_URL" },
    { label: "REDIS_URL", hint: "Redis / BullMQ", ok: env.redisUrl, code: "REDIS_URL" },
    {
      label: "NEXTAUTH_SECRET",
      hint: "NextAuth — bắt buộc production",
      ok: env.nextAuthSecret,
      code: "NEXTAUTH_SECRET",
    },
    {
      label: "NEXTAUTH_URL",
      hint: env.nextAuthUrl ?? "Ví dụ http://localhost:3000",
      ok: Boolean(env.nextAuthUrl),
      code: "NEXTAUTH_URL",
    },
    {
      label: "Google OAuth",
      hint: "Đăng nhập app — GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
      ok: env.googleOAuth,
    },
    {
      label: "GOOGLE_GENERATIVE_AI_API_KEY (env)",
      hint: "Gemini — free tier tại aistudio.google.com",
      ok: env.googleGenerativeAiApiKey,
      code: "GOOGLE_GENERATIVE_AI_API_KEY",
    },
    {
      label: "AI_MODEL_ID (optional)",
      hint: `Mặc định ${DEFAULT_GEMINI_MODEL} nếu không set`,
      ok: Boolean(env.aiModelId),
      code: "AI_MODEL_ID",
    },
    {
      label: "GITHUB_TOKEN (env)",
      hint: "PAT để AI đọc PR — hoặc lưu trong Integrations bên dưới",
      ok: env.githubToken,
      code: "GITHUB_TOKEN",
    },
    {
      label: "SLACK_WEBHOOK_URL (env)",
      hint: "Incoming Webhook — hoặc lưu trong Integrations",
      ok: env.slackWebhookUrl,
      code: "SLACK_WEBHOOK_URL",
    },
  ];

  const githubStored = Boolean(userSettings?.githubToken?.trim());
  const slackStored = Boolean(userSettings?.slackWebhookUrl?.trim());
  let githubSource: "env" | "settings" | "none" = "none";
  if (githubStored) githubSource = "settings";
  else if (env.githubToken) githubSource = "env";
  let slackSource: "env" | "settings" | "none" = "none";
  if (slackStored) slackSource = "settings";
  else if (env.slackWebhookUrl) slackSource = "env";

  return (
    <div className="space-y-10">
      <header className="space-y-1 border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Cấu hình & API keys</h1>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          AI Chat (<strong className="font-medium text-foreground">Gemini</strong>), tích hợp{" "}
          <strong className="font-medium text-foreground">GitHub PR</strong> +{" "}
          <strong className="font-medium text-foreground">Slack</strong> qua tool trong chat. Key chỉ hiển thị trạng
          thái có/không, không lộ giá trị.
        </p>
      </header>

      <section className="space-y-4" aria-labelledby="ai-keys-heading">
        <h2 id="ai-keys-heading" className="text-lg font-semibold tracking-tight">
          AI — Google Gemini
        </h2>
        <Card size="sm">
          <CardHeader>
            <CardTitle>API key</CardTitle>
            <CardDescription>
              Tạo key miễn phí tại{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Google AI Studio
              </a>
              . Biến môi trường: <code className="text-xs">GOOGLE_GENERATIVE_AI_API_KEY</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GeminiKeyForm
              hasStoredOverride={hasStoredOverride}
              effectiveSource={effectiveSource}
              defaultModelLabel={defaultModelLabel}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="integrations-heading">
        <h2 id="integrations-heading" className="text-lg font-semibold tracking-tight">
          Integrations — GitHub & Slack
        </h2>
        <Card size="sm">
          <CardHeader>
            <CardTitle>AI Chat</CardTitle>
            <CardDescription>
              Agent có tool <code className="text-xs">listMyOpenGithubPullRequests</code> và{" "}
              <code className="text-xs">notifySlack</code>. Ví dụ: &quot;Liệt kê PR mở của tôi trên GitHub và gửi tóm
              tắt vào Slack&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationsForm
              githubStored={githubStored}
              slackStored={slackStored}
              githubSource={githubSource}
              slackSource={slackSource}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="server-env-heading">
        <h2 id="server-env-heading" className="text-lg font-semibold tracking-tight">
          Môi trường máy chủ
        </h2>
        <p className="text-sm text-muted-foreground">
          Các giá trị lấy từ <code className="text-xs">process.env</code> lúc runtime (thường từ{" "}
          <code className="text-xs">.env.local</code> khi dev).
        </p>
        <Card size="sm" className="overflow-hidden">
          <CardContent className="space-y-0 divide-y divide-border p-0">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{row.label}</span>
                    <ConfigStatusPill ok={row.ok} />
                  </div>
                  <p className="text-xs text-muted-foreground">{row.hint}</p>
                  {row.code ? (
                    <p className="font-mono text-[0.65rem] text-muted-foreground/80">{row.code}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Gợi ý model khác / Other free options</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <strong className="text-foreground">Gemini</strong> (đang dùng): set{" "}
            <code className="text-xs">AI_MODEL_ID</code> ví dụ <code className="text-xs">gemini-2.5-flash</code>{" "}
            nếu Google hỗ trợ trên key của bạn.
          </li>
          <li>
            <strong className="text-foreground">Groq</strong> / OpenRouter: có thể thêm provider sau
            (OpenAI-compatible) nếu bạn muốn — hiện tại project dùng một provider cho đơn giản.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Bảo mật / Security</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Không commit <code className="text-xs">.env.local</code> lên git.</li>
          <li>Key lưu trong DB là plaintext — chỉ phù hợp môi trường tin cậy.</li>
          <li>Production: ưu tiên secrets của hosting.</li>
        </ul>
      </section>
    </div>
  );
}
