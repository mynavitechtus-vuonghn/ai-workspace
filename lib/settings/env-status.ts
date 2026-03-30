export type PublicEnvStatus = {
  databaseUrl: boolean;
  redisUrl: boolean;
  nextAuthSecret: boolean;
  nextAuthUrl: string | null;
  googleOAuth: boolean;
  /** Gemini / Google AI Studio */
  googleGenerativeAiApiKey: boolean;
  aiModelId: string | null;
  githubToken: boolean;
  slackWebhookUrl: boolean;
  /** Slack QA — PR chưa review */
  slackQaWebhookUrl: boolean;
  githubWatchRepos: boolean;
  cronSecret: boolean;
  backlogSpace: boolean;
};

export function getPublicEnvStatus(): PublicEnvStatus {
  return {
    databaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    redisUrl: Boolean(process.env.REDIS_URL?.trim()),
    nextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET?.trim()),
    nextAuthUrl: process.env.NEXTAUTH_URL?.trim() || null,
    googleOAuth: Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
    ),
    googleGenerativeAiApiKey: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()),
    aiModelId: process.env.AI_MODEL_ID?.trim() || null,
    githubToken: Boolean(process.env.GITHUB_TOKEN?.trim()),
    slackWebhookUrl: Boolean(process.env.SLACK_WEBHOOK_URL?.trim()),
    slackQaWebhookUrl: Boolean(process.env.SLACK_QA_WEBHOOK_URL?.trim()),
    githubWatchRepos: Boolean(process.env.GITHUB_WATCH_REPOS?.trim()),
    cronSecret: Boolean(process.env.CRON_SECRET?.trim()),
    backlogSpace: Boolean(process.env.BACKLOG_SPACE?.trim()),
  };
}
