# Reference — streaming & models (AI skill)

## Packages

- `ai` — `streamText`, `ModelMessage`, response helpers.
- `@ai-sdk/anthropic` — `anthropic("claude-sonnet-4-20250514")` (update id if project standard changes).

## Files

| File | Role |
|------|------|
| `app/api/chat/route.ts` | HTTP POST → stream to client |
| `lib/ai/agent.ts` | `runChatAgent` — model + system prompt |
| `lib/ai/tools.ts` | DB-side helpers (wire as tools when using tool API) |
| `lib/ai/skills.ts` | Named skill metadata (prompts, tool names) |
| `lib/ai/sub-agents.ts` | BullMQ enqueue |

## Security

- Never expose `ANTHROPIC_API_KEY` to client.
- Validate `userId` / session on the server before trusting tool execution.
