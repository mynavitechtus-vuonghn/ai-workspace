import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import type { ModelMessage } from "ai";

type ChatAgentInput = {
  userId: string;
  messages: ModelMessage[];
};

export function runChatAgent({ userId, messages }: ChatAgentInput) {
  return streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are an AI productivity assistant.
You can help with task planning, summarizing work, and creating tasks.
Current user id: ${userId}.`,
    messages,
  });
}
