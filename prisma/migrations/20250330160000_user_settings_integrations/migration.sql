-- GitHub PAT + Slack Incoming Webhook (per-user overrides; env fallback in app)
ALTER TABLE "UserSettings" ADD COLUMN "githubToken" TEXT;
ALTER TABLE "UserSettings" ADD COLUMN "slackWebhookUrl" TEXT;
