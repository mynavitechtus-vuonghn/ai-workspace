export type SkillTemplate = {
  name: string;
  description: string;
  prompt: string;
  tools: string[];
};

export const skills: Record<string, SkillTemplate> = {
  analyzePR: {
    name: "Analyze Pull Request",
    description: "Review code quality and identify risks",
    prompt:
      "You are a senior developer. Analyze this PR and report bugs, performance issues, style issues, and security concerns.",
    tools: ["github_get_pr", "github_get_diff"],
  },
  estimateTask: {
    name: "Estimate Task",
    description: "Estimate effort for new tasks",
    prompt: "Estimate implementation effort using similar past tasks and constraints.",
    tools: ["get_task_history", "create_task"],
  },
  dailyStandup: {
    name: "Daily Standup",
    description: "Generate daily progress summary",
    prompt: "Generate standup report in format: Yesterday / Today / Blockers.",
    tools: ["get_completed_tasks", "get_today_tasks", "get_calendar"],
  },
};
