---
name: ai-workspace-vercel-ai-agent
description: >-
  AI agent and streaming patterns for ai-dev-workspace—Vercel AI SDK, Anthropic Claude,
  chat route, and tool helpers. Use when implementing chat UI, tools, skills, or
  changing lib/ai or app/api/chat.
---

# AI — Vercel AI SDK + Claude

## Env

- `ANTHROPIC_API_KEY` required for chat in production; document in `.env.example` only as empty placeholder.

## Entry point

- **Route:** `app/api/chat/route.ts` — `POST` JSON body: `{ userId, messages }` (`messages`: `ModelMessage[]` from `ai` package).
- **Agent:** `lib/ai/agent.ts` — `streamText` with `anthropic("claude-sonnet-4-20250514")`.

## Tools

- `lib/ai/tools.ts` — plain async helpers (`createTaskTool`, `listTasksTool`) for DB side effects; wire into `streamText({ tools: ... })` when you add tool-calling back (Vercel AI SDK tool API must match installed `ai` version).
- `lib/ai/skills.ts` — declarative skill templates (names, prompts, tool names) — not executed until orchestrated.

## Sub-agents / background

- `lib/ai/sub-agents.ts` — BullMQ `Queue` for workflow jobs.
- Run workers separately from `next dev` (e.g. `npx tsx workers/workflow-worker.ts` once configured).

## Client chat (future)

- Use `useChat` from `@ai-sdk/react` (or current `ai` package export) pointing at `/api/chat`; pass `userId` from session.

## Constraints

- Do not leak API keys to client bundles; keep keys server-only.
- Match streaming response helper to the installed `ai` package (`toUIMessageStreamResponse` or equivalent — verify on upgrade).

## Additional resources (chi tiết / detail)

**Reference**

- [reference/streaming-and-models.md](reference/streaming-and-models.md)
- [reference/tools-and-skills-lib.md](reference/tools-and-skills-lib.md)

**Templates**

- [templates/chat-route-body.md](templates/chat-route-body.md)
- [templates/skill-registry-entry.md](templates/skill-registry-entry.md)
