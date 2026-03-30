"use client";

import { useRef } from "react";

import {
  clearGithubTokenOverride,
  clearSlackWebhookOverride,
  saveGithubToken,
  saveSlackWebhookUrl,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  /** Token saved in DB (shows clear + placeholder) */
  githubStored: boolean;
  slackStored: boolean;
  githubSource: "env" | "settings" | "none";
  slackSource: "env" | "settings" | "none";
};

export function IntegrationsForm({ githubStored, slackStored, githubSource, slackSource }: Props) {
  const ghForm = useRef<HTMLFormElement>(null);
  const slackForm = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">GitHub</h3>
          <p className="text-xs text-muted-foreground">
            <a
              href="https://github.com/settings/personal-access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Fine-grained or classic PAT
            </a>
            — quyền tối thiểu: <code className="text-[0.65rem]">repo</code> (đọc private PR) hoặc{" "}
            <code className="text-[0.65rem]">public_repo</code> nếu chỉ repo public.
          </p>
        </div>
        <form
          ref={ghForm}
          action={async (fd) => {
            await saveGithubToken(fd);
            ghForm.current?.reset();
          }}
          className="flex max-w-xl flex-col gap-3"
        >
          <div className="space-y-2">
            <Label htmlFor="githubToken">GITHUB_TOKEN (PAT)</Label>
            <Input
              id="githubToken"
              name="githubToken"
              type="password"
              autoComplete="off"
              placeholder={githubStored ? "•••• (đã lưu — nhập mới để thay)" : "ghp_… hoặc github_pat_…"}
              className="font-mono text-xs"
            />
          </div>
          <Button type="submit" size="sm">
            Lưu GitHub token
          </Button>
        </form>
        {githubStored ? (
          <form action={clearGithubTokenOverride}>
            <Button type="submit" variant="outline" size="sm">
              Xóa token đã lưu
            </Button>
          </form>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Nguồn:{" "}
          <span className="font-medium text-foreground">
            {githubSource === "settings" && "Đã lưu (tài khoản)"}
            {githubSource === "env" && "GITHUB_TOKEN trong env"}
            {githubSource === "none" && "Chưa có"}
          </span>
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-8">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Slack</h3>
          <p className="text-xs text-muted-foreground">
            Tạo{" "}
            <a
              href="https://api.slack.com/messaging/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Incoming Webhook
            </a>{" "}
            — URL dạng <code className="text-[0.65rem]">https://hooks.slack.com/services/…</code>
          </p>
        </div>
        <form
          ref={slackForm}
          action={async (fd) => {
            await saveSlackWebhookUrl(fd);
            slackForm.current?.reset();
          }}
          className="flex max-w-xl flex-col gap-3"
        >
          <div className="space-y-2">
            <Label htmlFor="slackWebhookUrl">SLACK_WEBHOOK_URL</Label>
            <Input
              id="slackWebhookUrl"
              name="slackWebhookUrl"
              type="password"
              autoComplete="off"
              placeholder={slackStored ? "•••• (đã lưu)" : "https://hooks.slack.com/services/…"}
              className="font-mono text-xs"
            />
          </div>
          <Button type="submit" size="sm">
            Lưu webhook
          </Button>
        </form>
        {slackStored ? (
          <form action={clearSlackWebhookOverride}>
            <Button type="submit" variant="outline" size="sm">
              Xóa webhook đã lưu
            </Button>
          </form>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Nguồn:{" "}
          <span className="font-medium text-foreground">
            {slackSource === "settings" && "Đã lưu (tài khoản)"}
            {slackSource === "env" && "SLACK_WEBHOOK_URL trong env"}
            {slackSource === "none" && "Chưa có"}
          </span>
        </p>
      </div>
    </div>
  );
}
