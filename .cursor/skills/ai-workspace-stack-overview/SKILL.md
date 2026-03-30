---
name: ai-workspace-stack-overview
description: >-
  Maps the ai-dev-workspace Next.js 16 monorepo (App Router, Prisma, shadcn, AI SDK, Docker).
  Use when onboarding, planning features, or when the user asks about project structure,
  scripts, env files, or where code should live.
---

# AI Dev Workspace — stack overview

## Stack (locked for this repo)

- **Framework:** Next.js 16 App Router, React 19, TypeScript, `output: "standalone"` for Docker.
- **UI:** Tailwind v4, shadcn (base-nova), `@/components/ui/*`, `cn()` from `@/lib/utils`.
- **Data:** PostgreSQL + Prisma (`prisma/schema.prisma`), `db` from `@/lib/db`.
- **Cache / queue:** Redis (`@/lib/redis`), BullMQ (`@/lib/ai/sub-agents.ts`, `workers/*`).
- **AI:** Vercel AI SDK + `@ai-sdk/anthropic`, route `app/api/chat/route.ts`, helpers under `lib/ai/*`.

## Key paths

| Area | Location |
|------|----------|
| Pages (dashboard) | `app/(dashboard)/*` |
| Auth placeholders | `app/(auth)/login`, `register` |
| API | `app/api/*` |
| Server Actions | `actions/*.ts` (`"use server"`) |
| Prisma | `prisma/schema.prisma`, migrations under `prisma/migrations` |
| Workers | `workers/*.ts` |

## Commands

- Dev (Turbopack): `npm run dev` — if CSS resolve fails, use `npm run dev:webpack`.
- Build: `npm run build` — run `npx prisma generate` after schema changes.
- Docker: see skill `ai-workspace-docker-next`.

## Env

- Copy `.env.example` → `.env.local` for local dev.
- Docker sample: `.env.docker.example` (service hostnames: `postgres`, `redis`).

## Constraints for agents

- Prefer **small, focused diffs**; match existing patterns in the same folder.
- Do **not** remove `turbopack.resolveAlias` entries in `next.config.ts` without verifying Tailwind/CSS still resolves on the user’s machine.
- **Server vs client:** `components/ui/button.tsx` is `"use client"`. For `Link` styled as a button inside **Server Components**, use `buttonVariants` from `@/lib/button-variants` (see skill `ai-workspace-ui-shadcn-rsc`).

## Additional resources (chi tiết / detail)

**Reference**

- [reference/repo-map.md](reference/repo-map.md)
- [reference/env-and-scripts.md](reference/env-and-scripts.md)

**Templates**

- [templates/where-to-put-code.md](templates/where-to-put-code.md)
- [templates/onboarding-checklist.md](templates/onboarding-checklist.md)
