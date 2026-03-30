# Reference — tools vs skills registry

## `lib/ai/tools.ts`

- Plain async functions wrapping `db` calls — suitable to connect to Vercel AI SDK **tools** when you add `tools: { ... }` to `streamText`.
- Keep inputs typed; validate IDs (user owns resource) before mutations.

## `lib/ai/skills.ts`

- **Declarative only:** name, description, prompt text, `tools: string[]` (logical names).
- Runtime orchestration (which skill runs when) is application logic — not auto-executed.

## Upgrade note

- When bumping `ai` / `@ai-sdk/anthropic`, re-check `streamText` options and tool definition API (names may change between major versions).
